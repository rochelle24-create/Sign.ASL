import base64
import logging
import os
from typing import Any

import cv2
import numpy as np
from flask import Flask, jsonify, request
from flask_cors import CORS
from PIL import Image
from transformers import pipeline

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

MODEL_ID = os.getenv(
    "ASL_MODEL_ID",
    "prithivMLmods/Alphabet-Sign-Language-Detection",
)
SKIP_LABELS = {"nothing", "del", "space"}

logger.info("Loading ASL alphabet classifier: %s", MODEL_ID)
classifier = pipeline(
    "image-classification",
    model=MODEL_ID,
    top_k=5,
)
logger.info("Model ready.")


def normalize_label(raw_label: str) -> str:
    """Normalize classifier labels to A-Z if possible."""
    label = raw_label.strip()
    if len(label) == 1 and label.isalpha():
        return label.upper()

    # Handle generic labels like LABEL_0 by using model id2label mapping.
    if label.startswith("LABEL_"):
        try:
            idx = int(label.split("_", 1)[1])
            mapped = classifier.model.config.id2label.get(idx)
            if isinstance(mapped, str) and len(mapped) == 1 and mapped.isalpha():
                return mapped.upper()
        except Exception:
            return label

    return label


def decode_frame(b64: str) -> Image.Image:
    img_bytes = base64.b64decode(b64)
    arr = np.frombuffer(img_bytes, dtype=np.uint8)
    bgr = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    rgb = cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)
    return Image.fromarray(rgb)


@app.route("/health", methods=["GET"])
def health() -> Any:
    return jsonify({"status": "ok"})


@app.route("/predict", methods=["POST"])
def predict() -> Any:
    data = request.get_json(force=True)
    frame_b64: str | None = data.get("frame")

    if not frame_b64:
        return jsonify({"error": "Missing 'frame' field"}), 400

    image = decode_frame(frame_b64)
    results = classifier(image)

    # Find best valid letter (skip nothing/del/space)
    for result in results:
        label = normalize_label(str(result["label"]))
        score: float = result["score"]
        if label not in SKIP_LABELS and len(label) == 1 and label.isalpha():
            return jsonify({
                "letter": label.upper(),
                "confidence": round(score, 3),
            })

    return jsonify({"letter": None, "confidence": 0.0})


if __name__ == "__main__":
    app.run(port=5000, debug=False)
