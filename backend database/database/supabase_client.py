import os
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables from .env file
load_dotenv()

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")

if not url or not key:
    raise ValueError("Missing SUPABASE_URL or SUPABASE_KEY in environment variables.")

supabase: Client = create_client(url, key)

def map_priority(severity: str) -> str:
    mapping = {
        "High": "Critical",
        "Medium": "High",
        "Low": "Low"
    }
    return mapping.get(severity, "Low")

def saveReport(image_url: str, latitude: float, longitude: float, damage: str, severity: str, priority: str) -> dict:
    """
    Inserts a new report row with status="Pending" and returns the inserted row.
    """
    try:
        data = {
            "image": image_url,
            "latitude": latitude,
            "longitude": longitude,
            "damage": damage,
            "severity": severity,
            "priority": priority,
            "status": "Pending"
        }
        
        response = supabase.table("reports").insert(data).execute()
        
        # supabase-py v2 returns data in response.data
        if response.data and len(response.data) > 0:
            return response.data[0]
        return None
    except Exception as e:
        raise Exception(f"Supabase error saving report: {str(e)}")

def getReports() -> list:
    """
    Returns all report rows ordered by created_at descending.
    """
    try:
        response = supabase.table("reports").select("*").order("created_at", desc=True).execute()
        return response.data
    except Exception as e:
        raise Exception(f"Supabase error fetching reports: {str(e)}")

def getReport(report_id: str) -> dict:
    """
    Returns a single report row by id, or None if not found.
    """
    try:
        response = supabase.table("reports").select("*").eq("id", report_id).execute()
        if response.data and len(response.data) > 0:
            return response.data[0]
        return None
    except Exception as e:
        raise Exception(f"Supabase error fetching report {report_id}: {str(e)}")

def getDashboardStats() -> dict:
    """
    Returns a dict with: total_reports, pending, completed, critical.
    """
    try:
        # Fetch all statuses and priorities to calculate stats in memory.
        # Alternatively, you could run specific count queries, but fetching 
        # just the necessary columns is usually efficient enough for basic dashboards.
        response = supabase.table("reports").select("status, priority").execute()
        
        reports = response.data
        total = len(reports)
        pending = sum(1 for r in reports if r.get("status", "").lower() == "pending")
        completed = sum(1 for r in reports if r.get("status", "").lower() == "completed")
        critical = sum(1 for r in reports if r.get("priority") == "Critical" or (isinstance(r.get("priority"), int) and r.get("priority") >= 80))
        # Note: Depending on if priority is a string ("Critical") or an int score (>= 80), 
        # both checks are included for robustness.
        
        return {
            "total_reports": total,
            "pending": pending,
            "completed": completed,
            "critical": critical
        }
    except Exception as e:
        raise Exception(f"Supabase error fetching dashboard stats: {str(e)}")
