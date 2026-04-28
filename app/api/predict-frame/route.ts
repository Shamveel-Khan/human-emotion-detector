import { NextResponse } from "next/server";

const DEFAULT_FLASK_API_URL = "http://127.0.0.1:5000";
const REQUEST_TIMEOUT_MS = 15000;

export async function POST(request: Request) {
    const flaskApiUrl = process.env.FLASK_API_URL ?? DEFAULT_FLASK_API_URL;

    let formData: FormData;

    try {
        formData = await request.formData();
    } catch {
        return NextResponse.json(
            { status: "error", message: "Invalid multipart form-data payload." },
            { status: 400 }
        );
    }

    const image = formData.get("image");

    if (!(image instanceof File)) {
        return NextResponse.json(
            { status: "error", message: "Please upload one image file." },
            { status: 400 }
        );
    }

    const forwardForm = new FormData();
    forwardForm.append("image", image, image.name || "webcam-frame");

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
        const response = await fetch(`${flaskApiUrl}/predict-frame`, {
            method: "POST",
            body: forwardForm,
            signal: controller.signal,
            cache: "no-store",
        });

        const payload = await response.json().catch(() => ({
            status: "error",
            message: "Backend returned an invalid response.",
        }));

        if (!response.ok) {
            const message =
                typeof payload?.message === "string"
                    ? payload.message
                    : "Frame prediction request failed.";

            return NextResponse.json(
                { status: "error", message },
                { status: response.status }
            );
        }

        return NextResponse.json(payload, { status: 200 });
    } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
            return NextResponse.json(
                {
                    status: "error",
                    message: "Frame prediction timed out. Please try again.",
                },
                { status: 504 }
            );
        }

        return NextResponse.json(
            {
                status: "error",
                message:
                    "Flask backend is unavailable. Please start the backend service.",
            },
            { status: 503 }
        );
    } finally {
        clearTimeout(timeout);
    }
}
