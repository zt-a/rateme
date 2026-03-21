import uuid
import os
import aiofiles
from fastapi import UploadFile, HTTPException

MEDIA_ROOT = "media"
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


def generate_filename(ext: str) -> str:
    return f"{uuid.uuid4()}.{ext}"


def get_person_upload_dir(person_id: int) -> str:
    return os.path.join(MEDIA_ROOT, "persons", str(person_id))


async def save_upload_file(file: UploadFile, person_id: int) -> str:
    """
    Сохраняет файл на диск.
    Возвращает относительный путь: media/persons/{person_id}/{uuid}.ext
    """
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type '{file.content_type}'. Allowed: jpeg, png, webp, gif"
        )

    # Читаем содержимое и проверяем размер
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large. Max size is 10MB")

    # Определяем расширение
    ext = file.content_type.split("/")[-1]
    if ext == "jpeg":
        ext = "jpg"

    filename = generate_filename(ext)
    upload_dir = get_person_upload_dir(person_id)
    os.makedirs(upload_dir, exist_ok=True)

    file_path = os.path.join(upload_dir, filename)
    async with aiofiles.open(file_path, "wb") as f:
        await f.write(contents)

    return file_path


def delete_file(file_path: str) -> None:
    """Удаляет файл с диска если существует"""
    if file_path and os.path.exists(file_path):
        os.remove(file_path)