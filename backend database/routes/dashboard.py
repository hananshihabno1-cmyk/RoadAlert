from fastapi import APIRouter
from database.supabase_client import getDashboardStats

router = APIRouter()

@router.get("/dashboard")
def get_dashboard():
    stats = getDashboardStats()
    return {
        "total_reports": stats.get("total_reports", 0),
        "high_severity": stats.get("critical", 0),
        "pending": stats.get("pending", 0),
        "completed": stats.get("completed", 0),
        "avg_priority": 75 # Mocked for now since backend doesn't calculate it
    }
