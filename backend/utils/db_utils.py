# utils/db_utils.py
import asyncio
from db.connection import engine, AsyncSessionLocal
from db.base import Base
import models  # noqa: F401
from logging_config import logger
from utils.admin_utils import create_admin
from config import settings

async def init_db():
    """Создает все таблицы"""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        logger.info("Tables created")

async def drop_db():
    """Удаляет все таблицы"""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        logger.info("Tables dropped")

async def main_loop():
    """Основной цикл сервера: создаем админа и ждём Ctrl+C"""
    async with AsyncSessionLocal() as session:
        await create_admin(
            session=session,
            email=settings.ADMIN_EMAIL,
            passw=settings.ADMIN_PASSWORD,
        )
        logger.info("Server running... Press Ctrl+C to exit.")
    while True:
        await asyncio.sleep(1)