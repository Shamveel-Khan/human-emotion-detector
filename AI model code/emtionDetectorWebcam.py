import cv2
import numpy as np
from tensorflow.keras.models import load_model

# Haar Cascade for face detection
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

# trained emotion model
model = load_model('emotion_model.keras')

# Define emotion classes
classes = ['Angry', 'Disgust', 'Fear', 'Happy', 'Neutral', 'Sad', 'Surprise']

# Preprocessing function 
def preprocess_face(face_img):
    face = cv2.resize(face_img, (48, 48))          # Resize to match model input
    face = face / 255.0                            # Normalize pixel values
    face = np.expand_dims(face, axis=-1)           # Add channel dimension (48,48,1)
    face = np.expand_dims(face, axis=0)            # Add batch dimension (1,48,48,1)
    return face

# Emotion prediction
def predict_emotion(face_img):
    processed = preprocess_face(face_img)
    prediction = model.predict(processed, verbose=0)
    class_idx = np.argmax(prediction)
    return classes[class_idx]

# Start webcam
cap = cv2.VideoCapture(0)

while True:
    ret, frame = cap.read()
    if not ret:
        break

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

    # face detection
    faces = face_cascade.detectMultiScale(gray, minNeighbors=10)

    for (x, y, w, h) in faces:
        # Crop face 
        face_gray = gray[y:y+h, x:x+w]
        label = predict_emotion(face_gray)

        # bounding box and predicted label
        cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)
        cv2.putText(frame, label, (x, y - 10),  cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 255, 0), 2)


    cv2.imshow('Webcam Emotion Detection', frame)


    if cv2.waitKey(1) & 0xFF == ord('q'):
        break


cap.release()
cv2.destroyAllWindows()
