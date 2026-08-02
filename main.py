from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import reports
from database import supabase

app = FastAPI(
    title="RoadAlert API",
    description="AI Road Intelligence Platform — Backend API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(reports.router, prefix="/reports", tags=["Reports"])


@app.get("/", tags=["Health"])
def root():
    return {"status": "Backend Running"}


@app.get("/dashboard", tags=["Dashboard"])
def dashboard_stats():
    """
    Compute and return aggregate dashboard statistics from the reports table or in-memory fallback.
    """
    try:
        rows = supabase.table("reports").select("severity, priority_score, status").execute().data or []
    except Exception:
        rows = reports._IN_MEMORY_REPORTS

    total = len(rows)
    high = sum(1 for r in rows if str(r.get("severity", "")).lower() == "high")
    completed = sum(1 for r in rows if str(r.get("status", "")).lower() == "completed")
    pending = total - completed
    avg = round(sum(r.get("priority_score", 0) for r in rows) / total, 1) if total else 0

    return {
        "total_reports": total,
        "high_severity": high,
        "pending": pending,
        "completed": completed,
        "avg_priority": avg,
    }
