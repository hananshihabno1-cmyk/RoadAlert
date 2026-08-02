"""
Reports router — orchestrates upload, detection, scoring, and persistence.

All AI and scoring logic lives in the services layer.
This router only handles HTTP concerns: parsing, delegation, and responses.
"""

import logging
import uuid
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, File, Form, HTTPException, UploadFile, status
from fastapi.responses import JSONResponse

from database import supabase
from models import ReportResponse
from services.detector import detect_damage
from services.scorer import calculate_priority

logger = logging.getLogger(__name__)

router = APIRouter()

_STORAGE_BUCKET = "road-images"
_REPORTS_TABLE = "reports"
_IN_MEMORY_REPORTS: list[dict] = []


# ---------------------------------------------------------------------------
# POST /reports/upload
# ---------------------------------------------------------------------------

@router.post(
    "/upload",
    summary="Upload a road image and create a damage report",
    status_code=status.HTTP_200_OK,
)
async def upload_report(
    image: UploadFile = File(..., description="Road image (JPEG, PNG, etc.)"),
    latitude: float = Form(..., description="GPS latitude of the reported location"),
    longitude: float = Form(..., description="GPS longitude of the reported location"),
    reported_by: Optional[str] = Form(None, description="Name of the reporter (optional)"),
):
    """
    Full upload workflow:

    1. Validate and read the uploaded image.
    2. Run YOLOv8 damage detection.
    3. If no damage detected — return early (nothing is saved).
    4. Calculate severity and priority score.
    5. Upload the image to Supabase Storage.
    6. Insert the report record into the database.
    7. Return the saved report.
    """
    # -- 1. Read image bytes ------------------------------------------------
    image_bytes = await _read_upload(image)

    # -- 2. Detect damage ---------------------------------------------------
    try:
        detection = detect_damage(image_bytes)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Invalid image: {exc}",
        )
    except RuntimeError as exc:
        logger.error("Detection error: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Damage detection failed. Please try again.",
        )

    # -- 3. No damage found — return early, do not persist ------------------
    if not detection["detected"]:
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={"detected": False, "message": detection["message"]},
        )

    # -- 4. Score the detection ---------------------------------------------
    try:
        scoring = calculate_priority(
            damage_type=detection["damage_type"],
            confidence=detection["confidence"],
        )
    except (ValueError, TypeError) as exc:
        logger.error("Scoring error: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Priority scoring failed. Please try again.",
        )

    # -- 5. Upload image to Supabase Storage --------------------------------
    image_url = await _upload_image(image_bytes, image.content_type or "image/jpeg")

    # -- 6. Persist the report ----------------------------------------------
    record = {
        "image_url":      image_url,
        "latitude":       latitude,
        "longitude":      longitude,
        "damage_type":    detection["damage_type"],
        "severity":       scoring["severity"],
        "confidence":     detection["confidence"],
        "priority_score": scoring["priority_score"],
        "reported_by":    reported_by,
        "created_at":     datetime.now(timezone.utc).isoformat(),
    }

    saved = _insert_report(record)

    # -- 7. Return saved report ---------------------------------------------
    return ReportResponse(**saved)


# ---------------------------------------------------------------------------
# GET /reports
# ---------------------------------------------------------------------------

@router.get(
    "/",
    response_model=list[ReportResponse],
    summary="List all damage reports, newest first",
)
async def get_reports(limit: int = 50):
    """
    Return all damage reports ordered by creation date descending.

    Args:
        limit: Maximum number of records to return (default 50).
    """
    try:
        response = (
            supabase.table(_REPORTS_TABLE)
            .select("*")
            .order("created_at", desc=True)
            .limit(limit)
            .execute()
        )
        return [ReportResponse(**row) for row in (response.data or [])]
    except Exception as exc:
        logger.warning("Supabase unavailable, returning in-memory reports: %s", exc)
        return [ReportResponse(**row) for row in _IN_MEMORY_REPORTS[:limit]]


# ---------------------------------------------------------------------------
# GET /reports/{report_id}
# ---------------------------------------------------------------------------

@router.get(
    "/{report_id}",
    response_model=ReportResponse,
    summary="Get a single damage report by ID",
)
async def get_report(report_id: str):
    """
    Return a single report by its UUID.

    Raises:
        404: If no report with the given ID exists.
    """
    try:
        response = (
            supabase.table(_REPORTS_TABLE)
            .select("*")
            .eq("id", report_id)
            .single()
            .execute()
        )
        if response.data:
            return ReportResponse(**response.data)
    except Exception as exc:
        logger.warning("Supabase fetch failed for report '%s': %s", report_id, exc)

    # Fallback to in-memory store
    for r in _IN_MEMORY_REPORTS:
        if str(r.get("id")) == report_id:
            return ReportResponse(**r)

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Report '{report_id}' not found.",
    )


# ---------------------------------------------------------------------------
# Private helpers
# ---------------------------------------------------------------------------

async def _read_upload(image: UploadFile) -> bytes:
    """
    Read and basic-validate the uploaded file.

    Raises:
        HTTPException 400: If the file is empty or not an image MIME type.
    """
    if image.content_type and not image.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type '{image.content_type}'. Upload a valid image.",
        )

    image_bytes = await image.read()

    if not image_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty.",
        )

    return image_bytes


async def _upload_image(image_bytes: bytes, content_type: str) -> str:
    """
    Upload raw image bytes to Supabase Storage and return the public URL.
    Falls back to a Data URI if Supabase Storage is not configured.
    """
    filename = f"{uuid.uuid4()}.jpg"
    storage_path = f"uploads/{filename}"

    try:
        supabase.storage.from_(_STORAGE_BUCKET).upload(
            path=storage_path,
            file=image_bytes,
            file_options={"content-type": content_type},
        )
        public_url = supabase.storage.from_(_STORAGE_BUCKET).get_public_url(storage_path)
    except Exception as exc:
        logger.warning("Supabase Storage upload fallback (unconfigured/failed): %s", exc)
        import base64
        b64 = base64.b64encode(image_bytes).decode("utf-8")
        public_url = f"data:{content_type};base64,{b64}"

    return public_url


def _insert_report(record: dict) -> dict:
    """
    Insert a report record into the Supabase reports table and return the saved row.
    Falls back to in-memory store if Supabase DB is not configured.
    """
    record_with_id = {
        "id": str(uuid.uuid4()),
        **record
    }
    try:
        response = (
            supabase.table(_REPORTS_TABLE)
            .insert(record)
            .execute()
        )
        if response.data:
            record_with_id = response.data[0]
    except Exception as exc:
        logger.warning("Database insert fallback (unconfigured/failed): %s", exc)

    _IN_MEMORY_REPORTS.insert(0, record_with_id)
    return record_with_id
