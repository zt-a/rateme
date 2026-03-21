from pydantic import BaseModel
from datetime import datetime
from models.report import ReportType, ReportStatus

class ReportCreate(BaseModel):
    person_id: int | None = None
    name: str
    email: str
    type: ReportType
    message: str

class ReportResponse(BaseModel):
    id: int
    person_id: int | None
    user_id: int | None
    name: str
    email: str
    type: ReportType
    status: ReportStatus
    message: str
    created_at: datetime
    model_config = {"from_attributes": True}

class ReportStatusUpdate(BaseModel):
    status: ReportStatus