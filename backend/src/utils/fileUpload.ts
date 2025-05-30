import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';
import { ApiError } from '../middleware/errorHandler';

// Типы MIME для разрешенных типов файлов
type AllowedMimeType = 'image/jpeg' | 'image/png' | 'image/gif' | 'image/svg+xml' | 'application/pdf';

// Максимальный размер файла по умолчанию: 10 МБ
const DEFAULT_MAX_SIZE = 10 * 1024 * 1024;

// Пути для загрузки разных типов файлов
const UPLOAD_PATHS = {
  images: 'uploads/images',
  documents: 'uploads/documents',
  temp: 'uploads/temp'
};

// Разрешенные типы MIME для изображений
const ALLOWED_IMAGE_TYPES: AllowedMimeType[] = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/svg+xml'
];

// Разрешенные типы MIME для документов
const ALLOWED_DOCUMENT_TYPES: AllowedMimeType[] = [
  'application/pdf'
];

/**
 * Проверяет, существует ли директория, и создает её при необходимости
 */
function ensureDirectoryExists(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Генерирует уникальное имя файла на основе оригинального имени
 */
function generateUniqueFilename(originalname: string): string {
  const timestamp = Date.now();
  const randomString = crypto.randomBytes(8).toString('hex');
  const extension = path.extname(originalname);
  const sanitizedName = path.basename(originalname, extension)
    .replace(/[^a-zA-Z0-9]/g, '-')
    .toLowerCase();
    
  return `${sanitizedName}-${timestamp}-${randomString}${extension}`;
}

/**
 * Фильтр файлов для multer на основе разрешенных MIME-типов
 */
function fileFilter(allowedTypes: AllowedMimeType[]) {
  return (req: Request, file: Express.Multer.File, callback: FileFilterCallback) => {
    if (allowedTypes.includes(file.mimetype as AllowedMimeType)) {
      callback(null, true);
    } else {
      callback(new ApiError(400, `Недопустимый тип файла. Разрешены только: ${allowedTypes.join(', ')}`));
    }
  };
}

/**
 * Настройка multer для загрузки изображений
 */
export const imageUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(process.cwd(), UPLOAD_PATHS.images);
      ensureDirectoryExists(uploadDir);
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      cb(null, generateUniqueFilename(file.originalname));
    }
  }),
  limits: {
    fileSize: parseInt(process.env.MAX_IMAGE_SIZE || '') || DEFAULT_MAX_SIZE
  },
  fileFilter: fileFilter(ALLOWED_IMAGE_TYPES)
});

/**
 * Настройка multer для загрузки документов
 */
export const documentUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(process.cwd(), UPLOAD_PATHS.documents);
      ensureDirectoryExists(uploadDir);
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      cb(null, generateUniqueFilename(file.originalname));
    }
  }),
  limits: {
    fileSize: parseInt(process.env.MAX_DOCUMENT_SIZE || '') || DEFAULT_MAX_SIZE
  },
  fileFilter: fileFilter(ALLOWED_DOCUMENT_TYPES)
});

/**
 * Удаляет файл по относительному пути
 */
export function deleteFile(filePath: string): boolean {
  try {
    const fullPath = path.join(process.cwd(), filePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Ошибка при удалении файла:', error);
    return false;
  }
}

/**
 * Возвращает публичный URL для файла
 */
export function getFileUrl(filePath: string): string {
  // Преобразование абсолютного пути в относительный URL для клиента
  const relativePath = filePath.replace(/^.*?uploads[\\/]/, 'uploads/');
  return `${process.env.API_URL || ''}/${relativePath.replace(/\\/g, '/')}`;
}
