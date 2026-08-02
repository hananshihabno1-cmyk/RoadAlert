"""
Priority scoring engine for road damage reports.

Derives a human-readable severity label and a numeric priority score
from YOLOv8 detection output. Pure Python — no ML, no I/O.
"""

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

_SEVERITY_THRESHOLDS: list[tuple[float, str]] = [
    (0.75, "High"),
    (0.50, "Medium"),
    (0.00, "Low"),
]

_BASE_SCORES: dict[str, int] = {
    "High":   85,
    "Medium": 55,
    "Low":    20,
}

_MAX_SCORE = 100
_CONFIDENCE_BOOST_FACTOR = 15


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def calculate_priority(damage_type: str, confidence: float) -> dict:
    """
    Compute severity and priority score from a single detection result.

    Args:
        damage_type: The damage label returned by the detector (e.g. "pothole").
                     Accepted as-is — scoring is confidence-driven only.
        confidence:  Detection confidence in the range [0.0, 1.0].

    Returns:
        dict with two keys::

            {
                "severity":       "Low" | "Medium" | "High",
                "priority_score": int (0–100)
            }

    Raises:
        TypeError:  If ``confidence`` is not a numeric type.
        ValueError: If ``confidence`` is outside the valid [0.0, 1.0] range.
        ValueError: If ``damage_type`` is empty or not a string.
    """
    _validate_inputs(damage_type, confidence)

    severity = _classify_severity(confidence)
    score = _compute_score(severity, confidence)

    return {
        "severity": severity,
        "priority_score": score,
    }


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _validate_inputs(damage_type: str, confidence: float) -> None:
    """
    Validate scorer inputs before any computation.

    Raises:
        TypeError:  If confidence is not int or float.
        ValueError: If confidence is outside [0.0, 1.0] or damage_type is blank.
    """
    if not isinstance(confidence, (int, float)):
        raise TypeError(
            f"confidence must be a numeric value, got {type(confidence).__name__!r}."
        )

    if not (0.0 <= float(confidence) <= 1.0):
        raise ValueError(
            f"confidence must be between 0.0 and 1.0, got {confidence}."
        )

    if not isinstance(damage_type, str) or not damage_type.strip():
        raise ValueError(
            "damage_type must be a non-empty string."
        )


def _classify_severity(confidence: float) -> str:
    """
    Map a confidence score to a severity label.

    Thresholds (inclusive lower bound):
        >= 0.75  → High
        >= 0.50  → Medium
        >= 0.00  → Low

    Args:
        confidence: Validated float in [0.0, 1.0].

    Returns:
        Severity label string.
    """
    for threshold, label in _SEVERITY_THRESHOLDS:
        if confidence >= threshold:
            return label

    # Unreachable given validated input, but kept for safety.
    return "Low"


def _compute_score(severity: str, confidence: float) -> int:
    """
    Compute the final priority score from severity and confidence.

    Formula:
        score = base[severity] + round(confidence × 15)
        Capped at 100.

    Args:
        severity:   One of "Low", "Medium", "High".
        confidence: Validated float in [0.0, 1.0].

    Returns:
        Integer priority score in range [0, 100].
    """
    base = _BASE_SCORES[severity]
    boost = round(confidence * _CONFIDENCE_BOOST_FACTOR)
    return min(base + boost, _MAX_SCORE)
