import os

import cv2
import numpy as np
from sklearn.metrics import confusion_matrix, classification_report
from tensorflow.keras.models import load_model

classes = ["Angry", "Disgust", "Fear", "Happy", "Neutral", "Sad", "Surprise"]


def main():
    default_model_path = os.path.join(
        os.path.dirname(__file__),
        "emotion_model.keras",
    )
    model_path = os.getenv("EMOTION_MODEL_PATH", default_model_path)
    test_root = os.getenv(
        "EVAL_TEST_ROOT",
        os.path.join("Emotion detector", "test"),
    )
    if not os.path.isdir(test_root):
        print("Test folder not found:", test_root)
        return

    print("Loading model:", model_path)
    model = load_model(model_path)

    y_true = []
    y_pred = []
    total = 0
    missing = 0

    # map folder names to class indices (case-insensitive)
    folder_to_idx = {name.lower(): i for i, name in enumerate(classes)}

    for folder in sorted(os.listdir(test_root)):
        folder_path = os.path.join(test_root, folder)
        if not os.path.isdir(folder_path):
            continue
        label_name = folder.lower()
        true_idx = folder_to_idx.get(label_name)
        if true_idx is None:
            print("Skipping unknown folder:", folder)
            continue

        for fname in sorted(os.listdir(folder_path)):
            if not fname.lower().endswith((".png", ".jpg", ".jpeg", ".bmp")):
                continue
            img_path = os.path.join(folder_path, fname)
            img = cv2.imread(img_path, cv2.IMREAD_GRAYSCALE)
            if img is None:
                missing += 1
                continue
            try:
                face = cv2.resize(img, (48, 48)).astype("float32") / 255.0
                face = np.expand_dims(face, axis=(0, -1))
                preds = model.predict(face, verbose=0)[0]
                pred_idx = int(np.argmax(preds))
                y_true.append(true_idx)
                y_pred.append(pred_idx)
                total += 1
            except Exception as e:
                print("Error processing", img_path, e)

    print("\nProcessed", total, "images (", missing, "failed to load )")
    if total == 0:
        print("No images processed.")
        return

    print("\nClassification report:")
    print(
        classification_report(
            y_true,
            y_pred,
            target_names=classes,
            zero_division=0,
        )
    )

    print("Confusion matrix:")
    cm = confusion_matrix(y_true, y_pred)
    print(cm)


if __name__ == "__main__":
    main()
