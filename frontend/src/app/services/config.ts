export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Хелпер для фото — если уже полный URL (Cloudinary) возвращаем как есть
// если старый локальный путь — добавляем API_BASE_URL
export function getPhotoUrl(filePath: string): string {
  if (!filePath) return '';
  if (filePath.startsWith('http')) return filePath;
  return `${API_BASE_URL}/${filePath}`;
}