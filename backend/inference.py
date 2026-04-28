import os
from typing import Dict, List, Tuple

import cv2
import numpy as np
from tensorflow.keras.models import load_model

EMOTION_LABELS: List[str] = [
    "Angry",
    "Disgust",
    "Fear",
    "Happy",
    "Neutral",
    "Sad",
    "Surprise",
]

MODEL_PATH = os.getenv(
    "EMOTION_MODEL_PATH",
    os.path.join(os.path.dirname(__file__), "emotion_model.keras"),
)
MAX_FILE_SIZE_BYTES = int(os.getenv("MAX_UPLOAD_BYTES", str(5 * 1024 * 1024)))
ALLOWED_MIME_TYPES = {
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/bmp",
}

_model = None
_face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
)


class InferenceError(Exception):
    """Raised when inference cannot be completed."""


def load_emotion_model():
    global _model
    if _model is None:
        if not os.path.isfile(MODEL_PATH):
            raise InferenceError(f"Model file not found: {MODEL_PATH}")
        _model = load_model(MODEL_PATH)
    return _model


def validate_upload(image_bytes: bytes, mime_type: str) -> None:
    if not image_bytes:
        raise InferenceError("Empty file payload.")
    if len(image_bytes) > MAX_FILE_SIZE_BYTES:
        raise InferenceError(
            f"File is too large. Max allowed is {MAX_FILE_SIZE_BYTES} bytes."
        )
    if mime_type and mime_type.lower() not in ALLOWED_MIME_TYPES:
        raise InferenceError(
            "Unsupported file type. Upload a JPG, PNG, WEBP, or BMP image."
        )


def preprocess_image(image_bytes: bytes) -> np.ndarray:
    image_np = np.frombuffer(image_bytes, np.uint8)
    gray = cv2.imdecode(image_np, cv2.IMREAD_GRAYSCALE)

    if gray is None:
        message = "".join(
            [
                "Could not decode image. ",
                "The file may be corrupt or not a valid image.",
            ]
        )
        raise InferenceError(message)

    try:
        face = cv2.resize(gray, (48, 48)).astype("float32") / 255.0
        face = np.expand_dims(face, axis=(0, -1))
    except Exception as exc:
        message = f"Failed to prepare image for inference: {exc}"
        raise InferenceError(message) from exc

    return face


def preprocess_face_array(face_gray: np.ndarray) -> np.ndarray:
    try:
        face = cv2.resize(face_gray, (48, 48)).astype("float32") / 255.0
        face = np.expand_dims(face, axis=(0, -1))
    except Exception as exc:
        message = f"Failed to prepare face for inference: {exc}"
        raise InferenceError(message) from exc

    return face


def predict_from_bytes(
    image_bytes: bytes, mime_type: str = ""
) -> Tuple[str, float, List[Dict[str, float]]]:
    validate_upload(image_bytes=image_bytes, mime_type=mime_type)

    model = load_emotion_model()
    face = preprocess_image(image_bytes=image_bytes)

    try:
        probs = model.predict(face, verbose=0)[0]
    except Exception as exc:
        raise InferenceError(f"Model inference failed: {exc}") from exc

    top_index = int(np.argmax(probs))
    scores = [
        {"label": EMOTION_LABELS[index], "score": float(prob)}
        for index, prob in enumerate(probs)
    ]

    return EMOTION_LABELS[top_index], float(probs[top_index]), scores


def predict_faces_from_bytes(
    image_bytes: bytes, mime_type: str = ""
) -> Dict[str, object]:
    validate_upload(image_bytes=image_bytes, mime_type=mime_type)

    image_np = np.frombuffer(image_bytes, np.uint8)
    frame = cv2.imdecode(image_np, cv2.IMREAD_COLOR)

    if frame is None:
        raise InferenceError(
            "Could not decode image. The file may be corrupt or not a valid image."
        )

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    faces = _face_cascade.detectMultiScale(
        gray,
        scaleFactor=1.1,
        minNeighbors=5,
        minSize=(30, 30),
    )

    model = load_emotion_model()
    results: List[Dict[str, float]] = []

    for x, y, w, h in faces:
        face_gray = gray[y : y + h, x : x + w]
        processed = preprocess_face_array(face_gray)
        probs = model.predict(processed, verbose=0)[0]
        top_index = int(np.argmax(probs))
        results.append(
            {
                "x": int(x),
                "y": int(y),
                "w": int(w),
                "h": int(h),
                "emotion": EMOTION_LABELS[top_index],
                "confidence": float(probs[top_index]),
            }
        )

    return {
        "width": int(frame.shape[1]),
        "height": int(frame.shape[0]),
        "faces": results,
    }
