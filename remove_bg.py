import base64
import os
import numpy as np
from io import BytesIO
from flask import Flask, request, jsonify
from rembg import remove
from PIL import Image
from rembg.session_factory import new_session

# Initialize Flask app
app = Flask(__name__)

# Load only the default u2net model
session = new_session("u2net")

# Function to remove background
def remove_background(base64_string):
    input_data = base64.b64decode(base64_string)
    input_image = Image.open(BytesIO(input_data))

    # Apply background removal using u2net
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

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 10000))  # Render uses the $PORT env var
    app.run(host='0.0.0.0', port=port)
