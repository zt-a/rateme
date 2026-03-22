# utils/create_admin.py
import secrets
from sqlalchemy.ext.asyncio import AsyncSession
from models.user import User
from utils.password_utils import hash_password
from utils.email_utils import send_confirm_email
from logging_config import logger
from config import settings

async def create_admin(session: AsyncSession, email=settings.ADMIN_EMAIL, passw=settings.ADMIN_PASSWORD) -> None:
    """Создает админа с рандомным паролем и отправляет письмо с подтверждением"""
    import string
    alphabet = string.ascii_letters + string.digits

    # Генерация пароля
    password_to_use = passw or ''.join(secrets.choice(alphabet) for _ in range(12))

    # Генерация токена подтверждения
    confirm_token = secrets.token_urlsafe(32)

    # Создаем администратора
    admin = User(
        email=email,
        hashed_password=hash_password(password_to_use),
        username=settings.ADMIN_USERNAME or "admin",
        balance=10000,
        phone=996701500422,
        is_admin=True,
        is_moderator=True,
        is_active=True,
        meta={"confirm_token": confirm_token},
    )
    session.add(admin)
    await session.commit()

    # Отправка письма с подтверждением
    try:
        await send_confirm_email(admin.email, confirm_token)
        logger.info(f"Admin created! Email: {admin.email}, Password: {password_to_use}")
        logger.info("Confirmation email sent.")
    except Exception as e:
        logger.error(f"Failed to send confirmation email: {e}")