import asyncio
from contextlib import asynccontextmanager
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from db.cleanup import delete_old_audit_logs
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from logging_config import logger
from utils.db_utils import init_db, main_loop, drop_db
from config import settings
from routes import routers
from pytz import utc

scheduler = AsyncIOScheduler(timezone=utc)

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing database...")
    await init_db()

    task = asyncio.create_task(main_loop())

    async def cleanup_job():
        await delete_old_audit_logs()

    await cleanup_job()

    scheduler.add_job(cleanup_job, "interval", hours=24)
    scheduler.start()

    logger.info("Server started.")
    yield

    logger.info("Shutting down...")
    scheduler.shutdown(wait=False)
    # await drop_db()

    task.cancel()
    try:
        await task
    except asyncio.CancelledError:
        pass

    logger.info("Shutdown complete.")

app = FastAPI(lifespan=lifespan)

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    settings.FRONTEND_URL,
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    logger.info('endpoint \'/\': [status] ok')
    return {"status": "ok"}

for router in routers:
    app.include_router(router)

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.UVICORN_HOST,
        port=settings.UVICORN_PORT,
        reload=settings.DEBUG,
        log_config=None,
    )