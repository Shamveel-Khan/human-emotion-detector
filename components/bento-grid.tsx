"use client";

import { useEffect, useRef, useState } from "react";
import { UploadCloud } from "lucide-react";
import { EmotionResults } from "@/components/emotion-results";

type EmotionScore = {
    label: string;
    score: number;
};

type PredictionResult = {
    emotion: string;
    confidence: number;
    scores: EmotionScore[];
};

export function BentoGrid() {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [fileName, setFileName] = useState("");
    const [previewUrl, setPreviewUrl] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [result, setResult] = useState<PredictionResult | null>(null);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const handleFile = (file: File | null) => {
        if (!file || !file.type.startsWith("image/")) {
            setError("Please select a valid image file.");
            return;
        }

        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }

        setError("");
        setResult(null);
        setSelectedFile(file);
        setFileName(file.name);
        setPreviewUrl(URL.createObjectURL(file));
    };

    const handleAnalyze = async () => {
        if (!selectedFile) {
            setError("Please upload an image first.");
            return;
        }

        setIsLoading(true);
        setError("");

        const formData = new FormData();
        formData.append("image", selectedFile);

        try {
            const response = await fetch("/api/predict", {
                method: "POST",
                body: formData,
            });

            const payload = await response.json().catch(() => null);
            if (!response.ok || !payload || payload.status !== "success") {
                const message =
                    typeof payload?.message === "string"
                        ? payload.message
                        : "Prediction failed. Please try again.";
                setResult(null);
                setError(message);
                return;
            }

            const nextResult = payload.result as PredictionResult;
            setResult(nextResult);
        } catch {
            setResult(null);
            setError("Could not reach prediction service. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section id="demo" className="py-24 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                        Select to Upload Picture
                    </h2>
                    <p className="text-zinc-400 max-w-2xl mx-auto">
                        Upload a clear face image to start emotion analysis.
                        Your photo will be prepared for processing on the next
                        step.
                    </p>
                </div>

                <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6 sm:p-8">
                    <input
                        ref={inputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(event) => {
                            const selected = event.target.files?.[0] ?? null;
                            handleFile(selected);
                        }}
                    />

                    <div
                        role="button"
                        tabIndex={0}
                        className={`group relative rounded-xl border-2 border-dashed p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 ${
                            isDragging
                                ? "border-indigo-400 bg-zinc-800/70"
                                : "border-zinc-700 bg-zinc-800/40 hover:border-zinc-500"
                        }`}
                        onClick={() => inputRef.current?.click()}
                        onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault();
                                inputRef.current?.click();
                            }
                        }}
                        onDragOver={(event) => {
                            event.preventDefault();
                            setIsDragging(true);
                        }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={(event) => {
                            event.preventDefault();
                            setIsDragging(false);
                            const dropped =
                                event.dataTransfer.files?.[0] ?? null;
                            handleFile(dropped);
                        }}
                    >
                        <UploadCloud className="mx-auto mb-4 h-10 w-10 text-zinc-400 group-hover:text-zinc-200" />
                        <p className="text-white font-medium mb-1">
                            Drop your image here
                        </p>
                        <p className="text-zinc-400 text-sm">
                            or click to browse from your device
                        </p>
                        <p className="text-zinc-500 text-xs mt-4">
                            Supported: JPG, PNG, WEBP
                        </p>
                    </div>

                    {fileName && (
                        <div className="mt-6">
                            <p className="text-sm text-zinc-300 mb-3">
                                Selected file:{" "}
                                <span className="text-white">{fileName}</span>
                            </p>
                            <div className="rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={previewUrl}
                                    alt="Uploaded preview"
                                    className="w-full max-h-[420px] object-contain"
                                />
                            </div>

                            <button
                                type="button"
                                onClick={handleAnalyze}
                                disabled={isLoading}
                                className="mt-4 inline-flex items-center justify-center rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-300"
                            >
                                {isLoading ? "Analyzing..." : "Analyze Emotion"}
                            </button>

                            {error && (
                                <p className="mt-3 text-sm text-rose-400">
                                    {error}
                                </p>
                            )}

                            {result && (
                                <EmotionResults
                                    emotion={result.emotion}
                                    confidence={result.confidence}
                                    scores={result.scores}
                                />
                            )}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
