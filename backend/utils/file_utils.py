import uuid
import os
import cloudinary
import cloudinary.uploader
from fastapi import UploadFile, HTTPException
from config import settings

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB

# Настройка Cloudinary
cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
    secure=True,
)

async def save_upload_file(file: UploadFile, person_id: int) -> str:
    """
    Загружает файл в Cloudinary.
    Возвращает URL файла.
    """
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type '{file.content_type}'. Allowed: jpeg, png, webp, gif"
        )

    contents = await file.read()

    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large. Max size is 10MB")

    # Загружаем в Cloudinary
    public_id = f"rateme/persons/{person_id}/{uuid.uuid4()}"
    result = cloudinary.uploader.upload(
        contents,
        public_id=public_id,
        folder=f"rateme/persons/{person_id}",
        resource_type="image",
        transformation=[
            {"width": 800, "height": 1067, "crop": "limit"},  # максимум 800x1067
            {"quality": "auto"},
            {"fetch_format": "auto"},
        ]
    )

    return result["secure_url"]


def delete_file(file_path: str) -> None:
    """Удаляет файл из Cloudinary по URL или public_id"""
    if not file_path:
        return
    try:
        # Если это Cloudinary URL — извлекаем public_id
        if "cloudinary.com" in file_path:
            # URL формат: https://res.cloudinary.com/cloud/image/upload/v123/rateme/persons/1/uuid.jpg
            parts = file_path.split("/upload/")
            if len(parts) == 2:
                public_id = parts[1].split(".")[0]  # убираем расширение
                cloudinary.uploader.destroy(public_id)
        else:
            # Старый локальный файл
            if os.path.exists(file_path):
                os.remove(file_path)
    except Exception:
        pass