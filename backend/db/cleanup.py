from sqlalchemy import delete
from datetime import datetime, timedelta

from models.audit import AuditLog
from db.connection import AsyncSessionLocal
from config import settings

async def delete_old_audit_logs():
    async with AsyncSessionLocal() as session:
        cutoff = datetime.utcnow() - timedelta(days=settings.RETENTION_DAYS)

        stmt = delete(AuditLog).where(AuditLog.created_at < cutoff)
        await session.execute(stmt)
        await session.commit()