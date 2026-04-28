# Emotion Detection Integration

This project now includes a Flask backend for model inference and a Next.js proxy route for frontend uploads.

## Architecture

- Frontend upload UI: `components/bento-grid.tsx`
- Next.js proxy: `app/api/predict/route.ts`
- Flask API: `backend/app.py`
- Inference utilities: `backend/inference.py`
- Model artifact: `backend/emotion_model.keras`

Flow:

1. User uploads an image in the Next.js UI.
2. Frontend posts to `/api/predict`.
3. Next route forwards multipart form-data to Flask `/predict`.
4. Flask preprocesses image and runs the Keras model.
5. Scores and top emotion are returned to the UI.

## Run Locally

### 1) Install frontend deps

```bash
pnpm install
```

### 2) Set env files

Create `.env.local` from `.env.example`:

```bash
FLASK_API_URL=http://127.0.0.1:5000
```

Optionally create `backend/.env` from `backend/.env.example`.

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

Option B: single command (requires `pnpm install` after package update)

```bash
pnpm run dev:all
```

## API Contract

### `POST /predict` (Flask)

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
