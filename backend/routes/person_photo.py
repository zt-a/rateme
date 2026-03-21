from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from db.connection import get_session
from dependencies.auth import get_moderator
from models.user import User
from models.person import Person, PersonPhoto
from schemas.person import PersonPhotoResponse
from utils.file_utils import save_upload_file, delete_file

router = APIRouter(prefix="/persons/{person_id}/photos", tags=["person photos"])


@router.get("", response_model=list[PersonPhotoResponse])
async def list_photos(
    person_id: int,
    session: AsyncSession = Depends(get_session),
):
    """Публичный список фото"""
    result = await session.scalars(
        select(PersonPhoto).where(PersonPhoto.person_id == person_id)
    )
    return result.all()


@router.post("", response_model=PersonPhotoResponse, status_code=status.HTTP_201_CREATED)
async def upload_photo(
    person_id: int,
    file: UploadFile = File(...),
    session: AsyncSession = Depends(get_session),
    moderator: User = Depends(get_moderator),
):
    """Загрузить фото — только модераторы и админы"""
    person = await session.get(Person, person_id)
    if not person or person.deleted_at is not None:
        raise HTTPException(status_code=404, detail="Person not found")

    file_path = await save_upload_file(file, person_id)

    photo = PersonPhoto(person_id=person_id, file_path=file_path)
    session.add(photo)
    await session.commit()
    await session.refresh(photo)
    return photo


@router.delete("/{photo_id}", status_code=status.HTTP_200_OK)
async def delete_photo(
    person_id: int,
    photo_id: int,
    session: AsyncSession = Depends(get_session),
    moderator: User = Depends(get_moderator),
):
    """Удалить фото — только модераторы и админы"""
    photo = await session.get(PersonPhoto, photo_id)
    if not photo or photo.person_id != person_id:
        raise HTTPException(status_code=404, detail="Photo not found")

    delete_file(photo.file_path)
    await session.delete(photo)
    await session.commit()
    return {"detail": "Photo deleted"}