"""
Vision module — handles TensorFlow model loading, image preprocessing,
and skin condition prediction.
"""

import os
import io
import json
import base64
import numpy as np
import tensorflow as tf
from PIL import Image

# Resolve paths relative to the backend root (one level up from this file)
_BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
_MODEL_PATH = os.path.join(_BACKEND_DIR, "model.h5")
_CLASS_INDICES_PATH = os.path.join(_BACKEND_DIR, "class_indices.json")

# Module-level state — populated on startup
model: tf.keras.Model | None = None
idx_to_class: dict[int, str] | None = None


def ensure_model_loaded() -> None:
    """Load the Keras model and class-index mapping from disk if not already loaded."""
    global model, idx_to_class

    if model is not None and idx_to_class is not None:
        return

    if os.path.exists(_MODEL_PATH) and os.path.exists(_CLASS_INDICES_PATH):
        print("Loading Model...")
        model = tf.keras.models.load_model(_MODEL_PATH)

        with open(_CLASS_INDICES_PATH, "r") as f:
            class_indices = json.load(f)
            idx_to_class = {v: k for k, v in class_indices.items()}

        print("Model loaded successfully.")
    else:
        print(
            "Warning: model.h5 or class_indices.json not found. "
            "Run train.py first to generate them."
        )


def preprocess_image(img_base64: str) -> np.ndarray:
    """
    Decode a base64 image string, resize it to 224x224, normalise pixel
    values to [0, 1], and return a batch-ready numpy array.
    """
    if img_base64.startswith("data:image"):
        img_base64 = img_base64.split(",")[1]

    img_data = base64.b64decode(img_base64)
    img = Image.open(io.BytesIO(img_data)).convert("RGB")
    img = img.resize((224, 224))

    img_arr = np.array(img) / 255.0
    img_arr = np.expand_dims(img_arr, axis=0)
    return img_arr


def predict(img_array: np.ndarray) -> tuple[str, float]:
    """
    Run a forward pass on the loaded model and return the predicted
    class name together with its confidence score.
    """
    ensure_model_loaded()
    
    if model is None or idx_to_class is None:
        raise RuntimeError("Model has not been loaded yet.")

    predictions = model.predict(img_array)
    pred_idx = int(np.argmax(predictions[0]))
    predicted_class = idx_to_class[pred_idx]
    confidence = float(np.max(predictions[0]))

    return predicted_class, confidence
