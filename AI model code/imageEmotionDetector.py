import cv2
import numpy as np
from tensorflow.keras.models import load_model

# Haar Cascade for face detection
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

# trained model
model = load_model('emotion_model.keras')

# Emotion classes 
classes = ['Angry', 'Disgust', 'Fear', 'Happy', 'Neutral', 'Sad', 'Surprise']


def preprocess_face(face_img):
    face = cv2.resize(face_img, (48, 48))
    face = face / 255.0
    face = np.expand_dims(face, axis=-1)
    face = np.expand_dims(face, axis=0)
    return face

def predict_emotion(face_img):
    processed = preprocess_face(face_img)
    prediction = model.predict(processed, verbose=0)
    class_idx = np.argmax(prediction)
    return classes[class_idx]


# image
img_path = "test copy.jpg"   
img = cv2.imread(img_path)

if img is None:
    print("Error: Image not found")
    exit()

# Convert to grayscale
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

# faces detection
faces = face_cascade.detectMultiScale(gray, scaleFactor=1.3, minNeighbors=5)

# If no face detected
if len(faces) == 0:
    print("No face detected")
else:
    for (x, y, w, h) in faces:
        # Crop face
        face_gray = gray[y:y+h, x:x+w]

        # Predicting emotion
        label = predict_emotion(face_gray)

        print("Predicted Emotion:", label)

        # bounding box and label
        cv2.rectangle(img, (x, y), (x + w, y + h), (0, 255, 0), 2)
        cv2.putText(img, label, (x, y - 10),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 255, 0), 2)


cv2.imshow("Emotion Prediction", img)
cv2.waitKey(0)
cv2.destroyAllWindows()