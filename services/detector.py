"""
Road damage detector using a pretrained YOLOv8 model.

The model is loaded once at module import time to avoid
repeated disk I/O on every request.
"""

import io
import logging
from typing import Union

from PIL import Image, UnidentifiedImageError
from ultralytics import YOLO

from config import settings

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Model — loaded once at startup
# ---------------------------------------------------------------------------

try:
    _model = YOLO(settings.MODEL_PATH)
    logger.info("YOLOv8 model loaded from '%s'", settings.MODEL_PATH)
except Exception as exc:
    logger.error("Failed to load YOLOv8 model from '%s': %s", settings.MODEL_PATH, exc)
    raise RuntimeError(
        f"Could not load YOLOv8 model from '{settings.MODEL_PATH}'. "
        "Check MODEL_PATH in your .env file."
    ) from exc


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def detect_damage(image_bytes: bytes) -> dict:
    """
    Run YOLOv8 inference on raw image bytes and return the highest-confidence detection.

    Args:
        image_bytes: Raw bytes of the uploaded image (JPEG, PNG, etc.).

    Returns:
        dict with one of two shapes:

        No detection:
            {
                "detected": False,
                "message": "No road damage detected."
            }

        Detection found:
            {
                "detected": True,
                "damage_type": str,
                "confidence": float,        # rounded to 4 decimal places
                "bounding_box": {
                    "x1": float,
                    "y1": float,
                    "x2": float,
                    "y2": float,
                }
            }

    Raises:
        ValueError: If the provided bytes cannot be decoded as a valid image.
        RuntimeError: If YOLO inference fails unexpectedly.
    """
    image = _decode_image(image_bytes)
    return _run_inference(image)


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _decode_image(image_bytes: bytes) -> Image.Image:
    """
    Decode raw bytes into a PIL Image.

    Raises:
        ValueError: If the bytes do not represent a valid image format.
    """
    if not image_bytes:
        raise ValueError("Image bytes are empty.")

    try:
        image = Image.open(io.BytesIO(image_bytes))
        image.verify()  # validate header without fully decoding
    except UnidentifiedImageError:
        raise ValueError("Cannot identify image format. Ensure the file is a valid image (JPEG, PNG, etc.).")
    except Exception as exc:
        raise ValueError(f"Image validation failed: {exc}") from exc

    # Re-open after verify() — verify() exhausts the stream
    try:
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    except Exception as exc:
        raise ValueError(f"Failed to decode image: {exc}") from exc

    return image


def _run_inference(image: Image.Image) -> dict:
    """
    Run YOLO inference on a PIL Image and return the best detection result.

    Raises:
        RuntimeError: If the YOLO model raises an unexpected error.
    """
    try:
        results = _model.predict(source=image, verbose=False)
    except Exception as exc:
        raise RuntimeError(f"YOLOv8 inference failed: {exc}") from exc

    best = _extract_best_detection(results)

    if best is None:
        return {
            "detected": False,
            "message": "No road damage detected.",
        }

    class_id, confidence, box = best
    label = _resolve_label(class_id)

    return {
        "detected": True,
        "damage_type": label,
        "confidence": round(float(confidence), 4),
        "bounding_box": {
            "x1": round(float(box[0]), 2),
            "y1": round(float(box[1]), 2),
            "x2": round(float(box[2]), 2),
            "y2": round(float(box[3]), 2),
        },
    }


def _extract_best_detection(
    results: list,
) -> Union[tuple[int, float, list], None]:
    """
    Scan all YOLO result boxes and return the single highest-confidence detection.

    Returns:
        Tuple of (class_id: int, confidence: float, box: [x1,y1,x2,y2])
        or None if no boxes were detected.
    """
    best_conf = -1.0
    best = None

    for result in results:
        if result.boxes is None or len(result.boxes) == 0:
            continue
        for box in result.boxes:
            conf = float(box.conf[0])
            if conf > best_conf:
                best_conf = conf
                cls_id = int(box.cls[0])
                xyxy = box.xyxy[0].tolist()  # [x1, y1, x2, y2]
                best = (cls_id, conf, xyxy)

    return best


def _resolve_label(class_id: int) -> str:
    """
    Resolve a YOLO class ID to a human-readable damage type label.

    Falls back to 'unknown_damage' if the class ID is not in the model's names.
    """
    names: dict = _model.names  # {int: str} populated by ultralytics
    return names.get(class_id, "unknown_damage")
