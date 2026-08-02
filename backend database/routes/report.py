from fastapi import APIRouter, HTTPException, File, UploadFile, Form
from database.supabase_client import saveReport, getReports, getReport, map_priority
import random

router = APIRouter()

@router.post("/report")
async def create_report(
    image: UploadFile = File(...),
    latitude: float = Form(...),
    longitude: float = Form(...)
):
    # Mock AI detection for hackathon
    damage_types = ["pothole", "crack", "faded_lane", "debris"]
    severities = ["high", "medium", "low"]
    
    damage = random.choice(damage_types)
    severity = random.choice(severities)
    
    # In a real app we'd upload `image.file` to Supabase storage. 
    # For now, mock the URL:
    image_url = f"https://picsum.photos/seed/{random.randint(1, 1000)}/800/600"

    priority = map_priority(severity)
    result = saveReport(
        image_url=image_url,
        latitude=latitude,
        longitude=longitude,
        damage=damage,
        severity=severity,
        priority=priority
    )
    if not result:
        raise HTTPException(status_code=500, detail="Failed to save report")
    return result

def map_report_for_frontend(r: dict) -> dict:
    if not r: return r
    
    priority_str = r.get("priority", "Low")
    score = 30
    if priority_str == "Critical":
        score = 90
    elif priority_str == "High":
        score = 70
        
    report_id = r.get("id", "")
    # Deterministically mark some reports as duplicates for demo purposes (~1 in 4)
    is_dup = False
    is_low_conf = False
    
    if report_id:
        try:
            val = int(report_id.replace("-", "")[:2], 16)
            if val % 4 == 0:
                is_dup = True
            elif val % 4 == 1:
                is_low_conf = True
        except:
            pass

    confidence = 0.45 if is_low_conf else 0.95
    mapped_severity = "unclear" if is_low_conf else r.get("severity", "low").lower()
    
    # If unclear, wipe the priority score since it isn't reliable
    if is_low_conf:
        score = 0

    return {
        "id": report_id,
        "image_url": r.get("image", ""),
        "latitude": r.get("latitude", 0.0),
        "longitude": r.get("longitude", 0.0),
        "damage_type": r.get("damage", "pothole").lower().replace(" ", "_"),
        "severity": mapped_severity,
        "confidence": confidence,
        "priority_score": score,
        "status": r.get("status", "pending").lower(),
        "near_school": False,
        "near_hospital": False,
        "main_road": True,
        "is_duplicate": is_dup,
        "created_at": r.get("created_at")
    }

@router.get("/reports")
def read_reports():
    reports = getReports()
    return [map_report_for_frontend(r) for r in reports] if reports else []

@router.get("/report/{id}")
def read_report(id: str):
    report = getReport(id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return map_report_for_frontend(report)
