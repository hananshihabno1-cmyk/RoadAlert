from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class ReportResponse(BaseModel):
    id: UUID
    image_url: str
    latitude: float
    longitude: float
    damage_type: str
    severity: str
    confidence: float
    priority_score: int
    reported_by: Optional[str] = None
    created_at: datetime
