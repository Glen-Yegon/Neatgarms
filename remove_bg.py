import base64
import cv2
import numpy as np
import os
from io import BytesIO
from flask import Flask, request, jsonify
from rembg import remove
from PIL import Image
from rembg.session_factory import new_session

# Initialize Flask app
app = Flask(__name__)

# Load models once at startup
human_session = new_session("u2net_human_seg")
default_session = new_session("u2net")

# Function to check if an image contains a human
def detect_human(image):
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
    image_np = np.array(image)
    gray = cv2.cvtColor(image_np, cv2.COLOR_RGB2GRAY)
    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))
    return len(faces) > 0

# Function to remove background
def remove_background(base64_string):
    input_data = base64.b64decode(base64_string)
    input_image = Image.open(BytesIO(input_data))

    # Choose model based on human detection
    session = human_session if detect_human(input_image) else default_session

    # Apply background removal
    output_image = remove(input_image, session=session)

    # Convert output image to Base64
    buffered = BytesIO()
    output_image.save(buffered, format="PNG")
    return base64.b64encode(buffered.getvalue()).decode()

# Flask API route
@app.route("/remove-bg", methods=["POST"])
def process_image():
    try:
        data = request.json
        if "image" not in data:
            return jsonify({"error": "No image provided"}), 400

        result_base64 = remove_background(data["image"])
        return jsonify({"processedImage": result_base64})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Run Flask app
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))  # Default to 10000 if Render doesn't provide one
    app.run(host="0.0.0.0", port=port)
