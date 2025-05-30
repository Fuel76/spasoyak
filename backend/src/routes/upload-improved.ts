import { Router } from 'express';
import { imageUpload, documentUpload, getFileUrl, deleteFile } from '../utils/fileUpload';
import { authenticateToken } from '../middleware/auth';
import { ApiError } from '../middleware/errorHandler';
import path from 'path';
import fs from 'fs';
import { logger } from '../utils/logger';

const router = Router();

/**
 * Загрузка изображения
 * POST /api/upload/image
 */
router.post('/image', authenticateToken, (req, res, next) => {
  imageUpload.single('image')(req, res, (err) => {
    if (err) {
      logger.error('Ошибка загрузки изображения:', err);
      return next(new ApiError(400, err.message));
    }

    if (!req.file) {
      return next(new ApiError(400, 'Файл не предоставлен'));
    }

    const fileUrl = getFileUrl(req.file.path);

    res.status(200).json({
      success: true,
      message: 'Изображение успешно загружено',
      fileName: req.file.filename,
      filePath: req.file.path,
      url: fileUrl
    });
  });
});

/**
 * Загрузка документа
 * POST /api/upload/document
 */
router.post('/document', authenticateToken, (req, res, next) => {
  documentUpload.single('document')(req, res, (err) => {
    if (err) {
      logger.error('Ошибка загрузки документа:', err);
      return next(new ApiError(400, err.message));
    }

    if (!req.file) {
      return next(new ApiError(400, 'Файл не предоставлен'));
    }

    const fileUrl = getFileUrl(req.file.path);

    res.status(200).json({
      success: true,
      message: 'Документ успешно загружен',
      fileName: req.file.filename,
      filePath: req.file.path,
      url: fileUrl
    });
  });
});

/**
 * Загрузка нескольких изображений
 * POST /api/upload/images
 */
router.post('/images', authenticateToken, (req, res, next) => {
  imageUpload.array('images', 10)(req, res, (err) => {
    if (err) {
      logger.error('Ошибка загрузки изображений:', err);
      return next(new ApiError(400, err.message));
    }

    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return next(new ApiError(400, 'Файлы не предоставлены'));
    }

    const files = Array.isArray(req.files) ? req.files : [req.files];
    const uploadedFiles = files.map(file => ({
      fileName: file.filename,
      filePath: file.path,
      url: getFileUrl(file.path)
    }));

    res.status(200).json({
      success: true,
      message: `${uploadedFiles.length} изображений успешно загружено`,
      files: uploadedFiles
    });
  });
});

/**
 * Удаление файла
 * DELETE /api/upload/file
 */
router.delete('/file', authenticateToken, (req, res, next) => {
  const { filePath } = req.body;
  
  if (!filePath) {
    return next(new ApiError(400, 'Путь к файлу не указан'));
  }
  
  // Проверяем, что путь относится к папке uploads
  if (!filePath.startsWith('uploads/')) {
    return next(new ApiError(403, 'Запрещено удалять файлы за пределами директории uploads'));
  }

  const deleted = deleteFile(filePath);
  
  if (deleted) {
    res.status(200).json({
      success: true,
      message: 'Файл успешно удален'
    });
  } else {
    next(new ApiError(404, 'Файл не найден или не может быть удален'));
  }
});

/**
 * Получение списка загруженных файлов по категории
 * GET /api/upload/list/:category
 */
router.get('/list/:category', authenticateToken, (req, res, next) => {
  const { category } = req.params;
  
  // Проверяем допустимость категории
  if (!['images', 'documents'].includes(category)) {
    return next(new ApiError(400, 'Недопустимая категория'));
  }
  
  const directoryPath = path.join(process.cwd(), 'uploads', category);
  
  // Проверяем существование директории
  if (!fs.existsSync(directoryPath)) {
    return res.status(200).json({
      success: true,
      files: []
    });
  }
  
  // Получаем список файлов
  try {
    const files = fs.readdirSync(directoryPath);
    const fileDetails = files.map(fileName => {
      const filePath = `uploads/${category}/${fileName}`;
      const stats = fs.statSync(path.join(process.cwd(), filePath));
      
      return {
        fileName,
        filePath,
        url: getFileUrl(filePath),
        size: stats.size,
        createdAt: stats.birthtime
      };
    });
    
    res.status(200).json({
      success: true,
      files: fileDetails
    });
  } catch (error) {
    logger.error('Ошибка при получении списка файлов:', error);
    next(new ApiError(500, 'Ошибка при получении списка файлов'));
  }
});

export default router;
