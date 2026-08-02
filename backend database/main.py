from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.report import router as report_router
from routes.dashboard import router as dashboard_router
from database.supabase_client import getReports
from contextlib import asynccontextmanager
import uvicorn

@asynccontextmanager
async def lifespan(app: FastAPI):
    # On backend startup, call getReports() and log the count
    try:
        reports = getReports()
        count = len(reports) if reports else 0
        print(f"==================================================")
        print(f"✅ Startup check: Supabase connection successful!")
        print(f"📊 Found {count} reports in the database.")
        print(f"==================================================")
    except Exception as e:
        print(f"==================================================")
        print(f"❌ Startup check failed: Could not fetch reports.")
        print(f"   Error: {e}")
        print(f"==================================================")
    yield
    # Shutdown logic if any

app = FastAPI(lifespan=lifespan)

# Allow CORS for the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Update for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(report_router)
app.include_router(dashboard_router)

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
