# main.py
import asyncio
from contextlib import asynccontextmanager

import uvicorn
from fastapi import FastAPI

from fastapi.middleware.cors import CORSMiddleware

from logging_config import logger
from utils.db_utils import init_db, drop_db, main_loop  # noqa: F401
from config import settings

from routes import routers
from fastapi.staticfiles import StaticFiles
import os



# --- Lifespan: замена on_startup/on_shutdown ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Initializing database...")
    await init_db()

    task = asyncio.create_task(main_loop())
    logger.info("Server started.")

    yield  # <-- здесь приложение работает

    # Shutdown
    logger.info("Shutting down...")
    task.cancel()
    try:
        await task
    except asyncio.CancelledError:
        pass

    # await drop_db()
    logger.info("Shutdown complete.")


# --- FastAPI app ---
app = FastAPI(lifespan=lifespan)
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,   # можно ["*"] для теста
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("media", exist_ok=True)
app.mount("/media", StaticFiles(directory="media"), name="media")

@app.get("/")
async def root():
    logger.info('endpoint \'/\': [status] ok')
    return {"status": "ok"}

for router in routers:
    app.include_router(router)


# --- Точка входа ---
if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.UVICORN_HOST,
        port=settings.UVICORN_PORT,
        reload=settings.DEBUG,
        log_config=None,
    )