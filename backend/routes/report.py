from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from db.connection import get_session
from dependencies.auth import get_moderator
from models.report import Report
from models.user import User
from schemas.report import ReportCreate, ReportResponse, ReportStatusUpdate
from typing import Optional
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from utils.jwt_utils import decode_access_token

router = APIRouter(prefix="/reports", tags=["reports"])
security = HTTPBearer(auto_error=False)

@router.post("", response_model=ReportResponse, status_code=201)
async def create_report(
    data: ReportCreate,
    session: AsyncSession = Depends(get_session),
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
):
    """Создать жалобу — публичный эндпоинт"""
    user_id = None
    if credentials:
        try:
            user_id = decode_access_token(credentials.credentials)
        except Exception:
            pass

    report = Report(
        person_id=data.person_id,
        user_id=user_id,
        name=data.name,
        email=data.email,
        type=data.type,
        message=data.message,
    )
    session.add(report)
    await session.commit()
    await session.refresh(report)
    return report

@router.get("", response_model=list[ReportResponse])
async def list_reports(
    session: AsyncSession = Depends(get_session),
    moderator: User = Depends(get_moderator),
    skip: int = 0,
    limit: int = 50,
    status: str | None = None,
):
    """Список жалоб — только модераторы"""
    query = select(Report).offset(skip).limit(limit).order_by(Report.created_at.desc())
    if status:
        query = query.where(Report.status == status)
    result = await session.scalars(query)
    return result.all()

@router.patch("/{report_id}", response_model=ReportResponse)
async def update_report_status(
    report_id: int,
    data: ReportStatusUpdate,
    session: AsyncSession = Depends(get_session),
    moderator: User = Depends(get_moderator),
):
    """Изменить статус жалобы — только модераторы"""
    report = await session.get(Report, report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    report.status = data.status
    await session.commit()
    await session.refresh(report)
    return report