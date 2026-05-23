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
_MODEL_PATH = os.path.join(_BACKEND_DIR, "model.tflite")
_CLASS_INDICES_PATH = os.path.join(_BACKEND_DIR, "class_indices.json")

# Module-level state — populated on startup
model: tf.lite.Interpreter | None = None
idx_to_class: dict[int, str] | None = None
input_details = None
output_details = None


def ensure_model_loaded() -> None:
    """Load the TFLite model and class-index mapping from disk if not already loaded."""
    global model, idx_to_class, input_details, output_details

    if model is not None and idx_to_class is not None:
        return

    if os.path.exists(_MODEL_PATH) and os.path.exists(_CLASS_INDICES_PATH):
        print("Loading TFLite Model...")
        model = tf.lite.Interpreter(model_path=_MODEL_PATH)
        model.allocate_tensors()
        
        input_details = model.get_input_details()
        output_details = model.get_output_details()

        with open(_CLASS_INDICES_PATH, "r") as f:
            class_indices = json.load(f)
            idx_to_class = {v: k for k, v in class_indices.items()}

        print("TFLite Model loaded successfully.")
    else:
        print(
            "Warning: model.tflite or class_indices.json not found. "
            "Please ensure they are present."
        )

def is_valid_skin_image(img_arr: np.ndarray) -> bool:
    """
    Heuristic check to see if the image contains a minimum amount of skin-like pixels.
    Expects img_arr of shape (1, H, W, 3) with values 0-255.
    """
    img = img_arr[0]
    R = img[:, :, 0]
    G = img[:, :, 1]
    B = img[:, :, 2]

    # Relaxed skin color bounds for various skin tones
    is_skin = (
        (R > 40) & 
        (G > 20) & 
        (B > 10) & 
        (R > G) & 
        (R > B) & 
        (np.abs(R - G) > 5)
    )
    
    # Calculate percentage of skin pixels
    skin_ratio = np.mean(is_skin)
    
    # If less than 10% of the image is considered skin, reject it
    return float(skin_ratio) > 0.10


def preprocess_image(img_base64: str) -> np.ndarray:
    """
    Decode a base64 image string, resize it to 224x224, normalise pixel
    values to [0, 1], and return a batch-ready numpy array.
    """
    if img_base64.startswith("data:image"):
        img_base64 = img_base64.split(",")[1]

    img_data = base64.b64decode(img_base64)
    img = Image.open(io.BytesIO(img_data)).convert("RGB")
    # EfficientNetB3 typically expects 300x300, matching your previous logic
    img = img.resize((300, 300))

    img_arr = np.array(img, dtype=np.float32)
    img_arr = np.expand_dims(img_arr, axis=0)
    return img_arr


def predict(img_array: np.ndarray) -> tuple[str, float]:
    """
    Run a forward pass on the loaded TFLite model and return the predicted
    class name together with its confidence score.
    """
    ensure_model_loaded()
    
    if model is None or idx_to_class is None:
        raise RuntimeError("Model has not been loaded yet.")

    model.set_tensor(input_details[0]['index'], img_array)
    model.invoke()
    predictions = model.get_tensor(output_details[0]['index'])
    
    pred_idx = int(np.argmax(predictions[0]))
    predicted_class = idx_to_class[pred_idx]
    
    # Map HAM10000 dataset short acronyms to full, human-readable medical names
    label_map = {
        "akiec": "Actinic Keratosis (AKIEC)",
        "bcc": "Basal Cell Carcinoma (BCC)",
        "bkl": "Benign Keratosis (BKL)",
        "df": "Dermatofibroma (DF)",
        "mel": "Melanoma (MEL)",
        "nv": "Melanocytic Nevi (NV)",
        "vasc": "Vascular Lesion (VASC)"
    }
    predicted_class = label_map.get(predicted_class, predicted_class.title())

    confidence = float(np.max(predictions[0]))

    return predicted_class, confidence
