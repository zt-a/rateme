# db/audit_listener.py
from sqlalchemy import event
from sqlalchemy.orm import Session
from sqlalchemy import inspect
from datetime import datetime, date
from decimal import Decimal
from models.audit import AuditLog, ActionType
from audit_context import current_user_id, current_ip, current_user_agent


def serialize_value(val):
    """Конвертирует не-JSON-сериализуемые типы"""
    if isinstance(val, (datetime, date)):
        return val.isoformat()
    if isinstance(val, Decimal):
        return float(val)
    if isinstance(val, bytes):
        return val.decode("utf-8", errors="replace")
    return val


def serialize_row(instance) -> dict:
    mapper = inspect(instance).mapper
    return {
        col.key: serialize_value(getattr(instance, col.key, None))
        for col in mapper.columns
    }


def create_audit_log(session: Session, instance, action: ActionType):
    row = serialize_row(instance)

    if action == ActionType.CREATE:
        old_data, new_data = None, row
    elif action == ActionType.UPDATE:
        old_data, new_data = row, row
    elif action == ActionType.DELETE:
        old_data, new_data = row, None

    log = AuditLog(
        table_name=instance.__tablename__,
        row_id=getattr(instance, "id", None),
        action=action,
        old_data=old_data,
        new_data=new_data,
        user_id=current_user_id.get(),
        ip=current_ip.get(),
        user_agent=current_user_agent.get(),
    )
    session.add(log)


@event.listens_for(Session, "before_flush")
def audit_before_flush(session, flush_context, instances):
    for obj in session.new:
        create_audit_log(session, obj, ActionType.CREATE)
    for obj in session.dirty:
        if session.is_modified(obj, include_collections=False):
            create_audit_log(session, obj, ActionType.UPDATE)
    for obj in session.deleted:
        create_audit_log(session, obj, ActionType.DELETE)