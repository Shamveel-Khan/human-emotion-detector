# Emotion Detection Web

Full-stack emotion detection app with:

- Next.js frontend (upload + realtime webcam UI)
- Flask backend (TensorFlow/Keras inference + face detection)
- Next.js API proxy routes for browser-safe backend access

## Features

- Image upload emotion detection with detailed confidence scores
- Realtime webcam detection with face boxes + top emotion overlay
- Error-safe backend validation and predictable JSON responses
- Local development scripts to run frontend + backend together

## Project Structure

- Frontend UI
    - `components/bento-grid.tsx` (image upload)
    - `components/webcam-emotion.tsx` (realtime webcam)
    - `components/emotion-results.tsx` (score visualization)
- Next.js API proxy
    - `app/api/predict/route.ts`
    - `app/api/predict-frame/route.ts`
- Flask backend
    - `backend/app.py` (routes)
    - `backend/inference.py` (model loading, preprocessing, face detection)
- Model
    - `backend/emotion_model.keras`

## Architecture Overview

Image flow:

1. User uploads an image in the UI.
2. Frontend posts to `/api/predict`.
3. Next proxy forwards to Flask `/predict`.
4. Flask preprocesses and returns emotion scores.

Webcam flow:

1. Browser captures frames and posts to `/api/predict-frame`.
2. Next proxy forwards to Flask `/predict-frame`.
3. Flask detects faces, predicts emotion per face, returns boxes + confidence.
4. Frontend draws boxes and overlays label text on video.

## Requirements

- Node.js 18+ and pnpm
- Python 3.11+ (or compatible with TensorFlow version in requirements)

## Setup (Local Development)

### 1) Install frontend deps

```bash
pnpm install
```

### 2) Configure environment

Create `.env.local` from `.env.example`:

```bash
FLASK_API_URL=http://127.0.0.1:5000
```

Optional: create `backend/.env` from `backend/.env.example`.

### 3) Install backend deps

```bash
python -m pip install -r backend/requirements.txt
```

### 4) Start services

Option A: separate terminals

```bash
pnpm dev
python backend/app.py
```

Option B: single command

```bash
pnpm run dev:all
```

Frontend: http://localhost:3000
Backend health: http://localhost:5000/health

## API Contracts

### POST /predict (Flask)

Request:

- `multipart/form-data`
- `image`: image file (jpg/jpeg/png/webp/bmp)

Success response:

```json
{
    "status": "success",
    "result": {
        "emotion": "Happy",
        "confidence": 0.94,
        "scores": [
            { "label": "Angry", "score": 0.01 },
            { "label": "Disgust", "score": 0.0 },
            { "label": "Fear", "score": 0.02 },
            { "label": "Happy", "score": 0.94 },
            { "label": "Neutral", "score": 0.02 },
            { "label": "Sad", "score": 0.01 },
            { "label": "Surprise", "score": 0.0 }
        ]
    }
}
```

Error response:

```json
{
    "status": "error",
    "message": "Human-readable error"
}
```

### POST /predict-frame (Flask)

Request:

- `multipart/form-data`
- `image`: webcam frame (jpg/png)

Success response:

```json
{
    "status": "success",
    "result": {
        "width": 1280,
        "height": 720,
        "faces": [
            {
                "x": 120,
                "y": 80,
                "w": 180,
                "h": 180,
                "emotion": "Happy",
                "confidence": 0.82
            }
        ]
    }
}
```

Error response:

```json
{
    "status": "error",
    "message": "Human-readable error"
}
```

## Environment Variables

Frontend (.env.local)

- `FLASK_API_URL` (example: `http://127.0.0.1:5000`)

Backend (backend/.env or system env)

- `FLASK_HOST` (default `0.0.0.0`)
- `FLASK_PORT` (default `5000`)
- `FLASK_DEBUG` (`true` or `false`)
- `CORS_ALLOWED_ORIGINS` (comma-separated list)
- `EMOTION_MODEL_PATH` (default `backend/emotion_model.keras`)
- `MAX_UPLOAD_BYTES` (default `5242880`)

## Troubleshooting

- Webcam not visible: allow camera permission in browser and ensure HTTPS in production.
- First prediction is slow: TensorFlow model loads once; later requests are faster.
- "Backend unavailable": start Flask or update `FLASK_API_URL`.
- Model file not found: run backend from project root so relative path resolves.

## Notes on Production

Vercel hosts the frontend only. Deploy Flask separately on a Python-friendly host
and set `FLASK_API_URL` in Vercel environment settings to the backend URL.
