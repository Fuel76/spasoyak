/**
 * Загрузка файла на сервер
 * @param file Файл для загрузки
 * @param type Тип файла (image, document и т.д.)
 * @returns URL загруженного файла
 */
export const uploadFile = async (file: File, type: 'image' | 'document' | 'template' = 'image'): Promise<string> => {
  if (!file) {
    throw new Error('Файл не выбран');
  }
  
  // Проверяем размер файла (например, максимум 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    throw new Error(`Файл слишком большой. Максимальный размер: ${maxSize / 1024 / 1024}MB`);
  }
  
  // Проверяем типы файлов
  const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
  const allowedDocTypes = ['.html', '.htm', '.css', '.txt'];
  const allowedTemplateTypes = ['.html', '.htm'];
  
  let allowed = false;
  
  if (type === 'image' && allowedImageTypes.includes(file.type)) {
    allowed = true;
  } else if (type === 'document') {
    allowed = allowedDocTypes.some(ext => file.name.toLowerCase().endsWith(ext));
  } else if (type === 'template') {
    allowed = allowedTemplateTypes.some(ext => file.name.toLowerCase().endsWith(ext));
  }
  
  if (!allowed) {
    throw new Error('Неподдерживаемый тип файла');
  }
  
  // Создаем FormData
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type);
  
  // Отправляем запрос на загрузку
  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Ошибка при загрузке файла');
  }
  
  const result = await response.json();
  return result.url; // URL загруженного файла
};