# utils/password_utils.py
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

def hash_password(plain: str) -> str:
    """Хеширует пароль"""
    return pwd_context.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    """Проверяет пароль против хеша"""
    return pwd_context.verify(plain, hashed)