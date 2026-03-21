import logging
from logging.handlers import RotatingFileHandler
import os

LOG_DIR = "logs"
os.makedirs(LOG_DIR, exist_ok=True)
LOG_FILE = os.path.join(LOG_DIR, "person_rating.log")

# -------------------------
# Формат логов
# -------------------------
formatter = logging.Formatter(
    "%(asctime)s [%(levelname)s] [%(name)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)

# -------------------------
# Console handler
# -------------------------
console_handler = logging.StreamHandler()
console_handler.setFormatter(formatter)
console_handler.setLevel(logging.INFO)

# -------------------------
# File handler (с ротацией)
# -------------------------
file_handler = RotatingFileHandler(
    LOG_FILE, maxBytes=5*1024*1024, backupCount=3, encoding="utf-8"
)
file_handler.setFormatter(formatter)
file_handler.setLevel(logging.INFO)

# -------------------------
# Главный логгер приложения
# -------------------------
logger = logging.getLogger("person_rating")
logger.setLevel(logging.INFO)
logger.addHandler(console_handler)
logger.addHandler(file_handler)

# -------------------------
# Настройка uvicorn (FastAPI) логов в тот же файл
# -------------------------
logging.getLogger("uvicorn").handlers = [console_handler, file_handler]
logging.getLogger("uvicorn.access").handlers = [console_handler, file_handler]