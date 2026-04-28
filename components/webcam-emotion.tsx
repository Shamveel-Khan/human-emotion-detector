"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type FacePrediction = {
    x: number;
    y: number;
    w: number;
    h: number;
    emotion: string;
    confidence: number;
};

type FrameResult = {
    width: number;
    height: number;
    faces: FacePrediction[];
};

export function WebcamEmotion() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const overlayRef = useRef<HTMLCanvasElement>(null);
    const captureRef = useRef<HTMLCanvasElement>(null);
    const intervalRef = useRef<number | null>(null);
    const isProcessingRef = useRef(false);

    const [isActive, setIsActive] = useState(false);
    const [error, setError] = useState("");

    const stopCapture = useCallback(() => {
        if (intervalRef.current) {
            window.clearInterval(intervalRef.current);
            intervalRef.current = null;
        }

        if (videoRef.current?.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach((track) => track.stop());
            videoRef.current.srcObject = null;
        }

        const overlay = overlayRef.current;
        if (overlay) {
            const ctx = overlay.getContext("2d");
            ctx?.clearRect(0, 0, overlay.width, overlay.height);
        }

        setIsActive(false);
    }, []);

    const drawOverlay = useCallback((result: FrameResult) => {
        const overlay = overlayRef.current;
        if (!overlay) {
            return;
        }

        const ctx = overlay.getContext("2d");
        if (!ctx) {
            return;
        }

        ctx.clearRect(0, 0, overlay.width, overlay.height);
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#22d3ee";
        ctx.fillStyle = "rgba(8, 47, 73, 0.75)";
        ctx.font = "16px sans-serif";

        result.faces.forEach((face) => {
            const label = `${face.emotion} ${(face.confidence * 100).toFixed(1)}%`;
            const textWidth = ctx.measureText(label).width;
            const padding = 6;
            const textX = face.x;
            const textY = Math.max(10, face.y - 12);

            ctx.strokeRect(face.x, face.y, face.w, face.h);
            ctx.fillRect(textX - 2, textY - 18, textWidth + padding * 2, 22);
            ctx.fillStyle = "#e2faff";
            ctx.fillText(label, textX + padding - 2, textY - 2);
            ctx.fillStyle = "rgba(8, 47, 73, 0.75)";
        });
    }, []);

    const captureFrame = useCallback(async () => {
        if (isProcessingRef.current) {
            return;
        }

        const video = videoRef.current;
        const captureCanvas = captureRef.current;
        if (!video || !captureCanvas) {
            return;
        }

        if (video.videoWidth === 0 || video.videoHeight === 0) {
            return;
        }

        isProcessingRef.current = true;

        captureCanvas.width = video.videoWidth;
        captureCanvas.height = video.videoHeight;

        const ctx = captureCanvas.getContext("2d");
        if (!ctx) {
            isProcessingRef.current = false;
            return;
        }

        ctx.drawImage(video, 0, 0, captureCanvas.width, captureCanvas.height);

        const blob = await new Promise<Blob | null>((resolve) => {
            captureCanvas.toBlob(resolve, "image/jpeg", 0.85);
        });

        if (!blob) {
            isProcessingRef.current = false;
            return;
        }

        const formData = new FormData();
        formData.append("image", blob, "webcam-frame.jpg");

        try {
            const response = await fetch("/api/predict-frame", {
                method: "POST",
                body: formData,
            });

            const payload = await response.json().catch(() => null);
            if (!response.ok || !payload || payload.status !== "success") {
                const message =
                    typeof payload?.message === "string"
                        ? payload.message
                        : "Frame prediction failed.";
                setError(message);
                return;
            }

            setError("");
            drawOverlay(payload.result as FrameResult);
        } catch {
            setError("Could not reach prediction service.");
        } finally {
            isProcessingRef.current = false;
        }
    }, [drawOverlay]);

    const startCapture = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: false,
            });

            const video = videoRef.current;
            if (!video) {
                return;
            }

            video.srcObject = stream;
            await video.play();

            const overlay = overlayRef.current;
            if (overlay) {
                overlay.width = video.videoWidth || 640;
                overlay.height = video.videoHeight || 480;
            }

            setIsActive(true);
            setError("");

            intervalRef.current = window.setInterval(() => {
                captureFrame();
            }, 300);
        } catch {
            setError("Camera access was denied or is unavailable.");
        }
    }, [captureFrame]);

    useEffect(() => {
        return () => stopCapture();
    }, [stopCapture]);

    return (
        <section className="py-24 px-4">
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-10">
                    <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                        Real-time Emotion Detector
                    </h2>
                    <p className="text-zinc-400 max-w-2xl mx-auto">
                        Start your webcam to see live emotion predictions with
                        face boxes and confidence scores.
                    </p>
                </div>

                <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 sm:p-8">
                    <div className="flex flex-wrap items-center gap-3 mb-6">
                        <button
                            type="button"
                            onClick={() =>
                                isActive ? stopCapture() : startCapture()
                            }
                            className="inline-flex items-center justify-center rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-cyan-400"
                        >
                            {isActive ? "Stop Webcam" : "Start Webcam"}
                        </button>

                        <p className="text-sm text-zinc-400">
                            {isActive
                                ? "Camera streaming. Results update every 0.3s."
                                : "Click to enable your camera."}
                        </p>
                    </div>

                    {error && (
                        <p className="mb-4 text-sm text-rose-400">{error}</p>
                    )}
                    <div
                        className={`relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 ${
                            isActive ? "block" : "hidden"
                        }`}
                    >
                        <video
                            ref={videoRef}
                            className="w-full h-auto"
                            playsInline
                            muted
                            onLoadedMetadata={() => {
                                const video = videoRef.current;
                                const overlay = overlayRef.current;
                                if (video && overlay) {
                                    overlay.width = video.videoWidth || 640;
                                    overlay.height = video.videoHeight || 480;
                                }
                            }}
                        />
                        <canvas
                            ref={overlayRef}
                            className="absolute left-0 top-0 h-full w-full"
                        />
                        <canvas ref={captureRef} className="hidden" />
                    </div>
                </div>
            </div>
        </section>
    );
}
