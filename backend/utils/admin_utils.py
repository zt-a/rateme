import secrets
import string
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from models.user import User
from utils.password_utils import hash_password
from utils.email_utils import send_confirm_email
from logging_config import logger
from config import settings

async def create_admin(session: AsyncSession, email=None, passw=None) -> None:
    """Создает админа если его ещё нет"""
    email = email or settings.ADMIN_EMAIL
    passw = passw or settings.ADMIN_PASSWORD

    # Проверяем существует ли уже админ
    existing = await session.scalar(select(User).where(User.email == email))
    if existing:
        logger.info(f"Admin already exists: {email}, skipping.")
        return

    alphabet = string.ascii_letters + string.digits
    password_to_use = passw or ''.join(secrets.choice(alphabet) for _ in range(12))
    confirm_token = secrets.token_urlsafe(32)

    admin = User(
        email=email,
        hashed_password=hash_password(password_to_use),
        username=settings.ADMIN_USERNAME or "admin",
        balance=10000,
        is_admin=True,
        is_moderator=True,
        is_active=True,
        meta={"confirm_token": confirm_token},
    )
    session.add(admin)
    await session.commit()

    try:
        await send_confirm_email(admin.email, confirm_token)
        logger.info(f"Admin created! Email: {admin.email}, Password: {password_to_use}")
        logger.info("Confirmation email sent.")
    except Exception as e:
        logger.error(f"Failed to send confirmation email: {e}")