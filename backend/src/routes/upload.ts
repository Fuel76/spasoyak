import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { sanitizeHtml } from '../utils/sanitize';

const router = Router();

// Настройка хранилища для multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadDir = 'uploads/images';
    
    if (file.fieldname === 'document' || file.mimetype.startsWith('text/')) {
      uploadDir = 'uploads/documents';
    }
    
    // Создаем директорию, если она не существует
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  
  filename: (req, file, cb) => {
    // Создаем уникальное имя файла
    const uniqueSuffix = Date.now() + '-' + crypto.randomBytes(6).toString('hex');
    const extension = path.extname(file.originalname);
    cb(null, uniqueSuffix + extension);
  }
});

// Фильтр файлов
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Разрешенные типы изображений
  const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
  
  // Разрешенные типы документов
  const allowedDocumentTypes = ['text/html', 'text/css', 'text/plain', 'application/json'];
  
  if (allowedImageTypes.includes(file.mimetype) || allowedDocumentTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Неподдерживаемый тип файла'));
  }
};

// Инициализация multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  }
});

// Маршрут для загрузки изображений
router.post('/image', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Файл не был загружен' });
    }
    
    // Формируем URL для доступа к файлу
    const fileUrl = `/${req.file.path.replace(/\\/g, '/')}`;
    
    res.json({
      success: true,
      url: fileUrl,
      filename: req.file.filename
    });
  } catch (error) {
    console.error('Ошибка загрузки изображения:', error);
    res.status(500).json({ error: 'Ошибка при загрузке изображения' });
  }
});

// Маршрут для загрузки файлов из SunEditor
router.post('/upload-image-from-editor', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: false,
        message: 'Файл не был загружен'
      });
    }

    // Формируем URL для доступа к файлу
    const fileUrl = `/${req.file.path.replace(/\\/g, '/')}`;
    
    // Отправляем ответ в формате, ожидаемом SunEditor
    res.json({
      status: true,
      message: 'Изображение успешно загружено',
      data: {
        url: fileUrl,
        name: req.file.filename,
        size: req.file.size,
        type: req.file.mimetype
      }
    });
  } catch (error) {
    console.error('Ошибка загрузки из редактора:', error);
    res.status(500).json({
      status: false,
      message: 'Ошибка при загрузке изображения'
    });
  }
});

export default router;