from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from jose import JWTError

from db.connection import get_session
from models.user import User
from utils.jwt_utils import decode_access_token

bearer_scheme = HTTPBearer()
bearer_scheme_optional = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    session: AsyncSession = Depends(get_session),
) -> User:
    token = credentials.credentials
    try:
        user_id = decode_access_token(token)
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")

    user = await session.get(User, user_id)
    if not user or not user.is_active or user.deleted_at is not None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found or inactive")

    return user


async def get_current_user_optional(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme_optional),
    session: AsyncSession = Depends(get_session),
) -> User | None:
    """Возвращает пользователя если токен передан, иначе None"""
    if not credentials:
        return None
    try:
        user_id = decode_access_token(credentials.credentials)
    except JWTError:
        return None
    user = await session.get(User, user_id)
    if not user or not user.is_active or user.deleted_at is not None:
        return None
    return user


async def get_moderator(current_user: User = Depends(get_current_user)) -> User:
    if not current_user.is_moderator and not current_user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Moderator access required")
    return current_user


async def get_admin(current_user: User = Depends(get_current_user)) -> User:
    if not current_user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return current_user