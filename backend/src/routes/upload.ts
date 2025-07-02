import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { sanitizeHtml } from '../utils/sanitize';
import { PostImagesService } from '../services/postimages';
import { promisify } from 'util';

const router = Router();
const unlink = promisify(fs.unlink);

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

// Маршрут для загрузки файлов из SunEditor с поддержкой PostImages
router.post('/upload-image-from-editor', upload.single('file'), async (req, res) => {
  console.log('=== SunEditor Upload Request ===');
  console.log('Request body:', req.body);
  console.log('Request file:', req.file);
  
  try {
    if (!req.file) {
      console.log('ERROR: No file uploaded');
      return res.status(400).json({
        status: false,
        message: 'Файл не был загружен'
      });
    }

    console.log('File info:', {
      filename: req.file.filename,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path
    });

    // Проверяем, нужно ли использовать PostImages
    const usePostImages = req.body.usePostImages === 'true' && req.file.mimetype.startsWith('image/');
    console.log('Use PostImages:', usePostImages);
    
    if (usePostImages) {
      try {
        // Загружаем на PostImages
        const postImagesUrl = await PostImagesService.uploadImage(req.file.path, req.file.originalname);
        
        // Удаляем временный файл
        await unlink(req.file.path);
        
        // Отправляем ответ в формате, ожидаемом SunEditor
        return res.json([{
          name: req.file.originalname,
          size: req.file.size,
          src: postImagesUrl
        }]);
      } catch (postImagesError) {
        console.warn('PostImages недоступен, используем локальное хранилище:', postImagesError);
        // Продолжаем с локальным хранилищем
      }
    }

    // Локальное хранилище
    const fileUrl = `/${req.file.path.replace(/\\/g, '/')}`;
    
    // Отправляем ответ в формате, ожидаемом SunEditor
    // SunEditor ожидает массив с объектами изображений для успешной загрузки
    res.json([{
      name: req.file.filename,
      size: req.file.size,
      src: fileUrl
    }]);
  } catch (error) {
    console.error('Ошибка загрузки из редактора:', error);
    res.status(500).json({
      status: false,
      message: 'Ошибка при загрузке изображения'
    });
  }
});

export default router;