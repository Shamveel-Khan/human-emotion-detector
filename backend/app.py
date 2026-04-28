import os

from flask import Flask, jsonify, request
from flask_cors import CORS

from inference import (
    InferenceError,
    load_emotion_model,
    predict_faces_from_bytes,
    predict_from_bytes,
)


def create_app() -> Flask:
    app = Flask(__name__)

    allowed_origins = os.getenv(
        "CORS_ALLOWED_ORIGINS",
        "http://localhost:3000",
    )
    CORS(
        app,
        resources={
            r"/*": {
                "origins": [
                    origin.strip()
                    for origin in allowed_origins.split(",")
                    if origin.strip()
                ]
            }
        },
    )

    @app.get("/health")
    def health():
        return jsonify({"status": "ok"}), 200

    @app.post("/predict")
    def predict():
        uploaded = request.files.get("image")
        if uploaded is None:
            return (
                jsonify(
                    {
                        "status": "error",
                        "message": "Missing 'image' file in form-data.",
                    }
                ),
                400,
            )

        try:
            image_bytes = uploaded.read()
            top_emotion, top_confidence, scores = predict_from_bytes(
                image_bytes=image_bytes,
                mime_type=uploaded.mimetype or "",
            )
        except InferenceError as exc:
            return jsonify({"status": "error", "message": str(exc)}), 400
        except Exception:
            message = "Unexpected server error during prediction."
            return (
                jsonify(
                    {
                        "status": "error",
                        "message": message,
                    }
                ),
                500,
            )

        return (
            jsonify(
                {
                    "status": "success",
                    "result": {
                        "emotion": top_emotion,
                        "confidence": top_confidence,
                        "scores": scores,
                    },
                }
            ),
            200,
        )

    @app.post("/predict-frame")
    def predict_frame():
        uploaded = request.files.get("image")
        if uploaded is None:
            return (
                jsonify(
                    {
                        "status": "error",
                        "message": "Missing 'image' file in form-data.",
                    }
                ),
                400,
            )

        try:
            image_bytes = uploaded.read()
            result = predict_faces_from_bytes(
                image_bytes=image_bytes,
                mime_type=uploaded.mimetype or "",
            )
        except InferenceError as exc:
            return jsonify({"status": "error", "message": str(exc)}), 400
        except Exception:
            message = "Unexpected server error during frame prediction."
            return (
                jsonify(
                    {
                        "status": "error",
                        "message": message,
                    }
                ),
                500,
            )

        return (
            jsonify(
                {
                    "status": "success",
                    "result": result,
                }
            ),
            200,
        )

    with app.app_context():
        load_emotion_model()

    return app


if __name__ == "__main__":
    flask_app = create_app()
    host = os.getenv("FLASK_HOST", "0.0.0.0")
    port = int(os.getenv("FLASK_PORT", "5000"))
    debug = os.getenv("FLASK_DEBUG", "false").lower() == "true"
    flask_app.run(host=host, port=port, debug=debug)
