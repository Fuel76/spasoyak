import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';

const router = Router();
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const unlink = promisify(fs.unlink);

// Настройка хранения файлов
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = file.mimetype.startsWith('image/') 
      ? 'uploads/images' 
      : 'uploads/documents';
    
    // Создаем директорию если не существует
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Генерируем уникальное имя файла
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB лимит
  },
  fileFilter: (req, file, cb) => {
    // Разрешенные типы файлов
    const allowedMimes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Недопустимый тип файла'));
    }
  }
});

// Middleware для аутентификации (базовая проверка)
const authenticate = (req: Request, res: Response, next: any) => {
  // Простая проверка токена из заголовков
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Требуется авторизация' });
  }
  
  // Здесь можно добавить более сложную проверку JWT
  next();
};

// Получить список изображений
router.get('/list/images', async (req: Request, res: Response) => {
  try {
    const imagesPath = 'uploads/images';
    
    if (!fs.existsSync(imagesPath)) {
      return res.json({ files: [] });
    }
    
    const files = await readdir(imagesPath);
    const fileStats = await Promise.all(
      files.map(async (fileName) => {
        const filePath = path.join(imagesPath, fileName);
        const stats = await stat(filePath);
        
        return {
          fileName,
          filePath: path.join('uploads/images', fileName),
          url: `/uploads/images/${fileName}`,
          size: stats.size,
          createdAt: stats.birthtime.toISOString()
        };
      })
    );
    
    // Сортируем по дате создания (новые первыми)
    fileStats.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    res.json({ files: fileStats });
  } catch (error) {
    console.error('Ошибка получения списка изображений:', error);
    res.status(500).json({ error: 'Ошибка получения списка изображений' });
  }
});

// Получить список документов
router.get('/list/documents', async (req: Request, res: Response) => {
  try {
    const documentsPath = 'uploads/documents';
    
    if (!fs.existsSync(documentsPath)) {
      return res.json({ files: [] });
    }
    
    const files = await readdir(documentsPath);
    const fileStats = await Promise.all(
      files.map(async (fileName) => {
        const filePath = path.join(documentsPath, fileName);
        const stats = await stat(filePath);
        
        return {
          fileName,
          filePath: path.join('uploads/documents', fileName),
          url: `/uploads/documents/${fileName}`,
          size: stats.size,
          createdAt: stats.birthtime.toISOString()
        };
      })
    );
    
    // Сортируем по дате создания (новые первыми)
    fileStats.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    res.json({ files: fileStats });
  } catch (error) {
    console.error('Ошибка получения списка документов:', error);
    res.status(500).json({ error: 'Ошибка получения списка документов' });
  }
});

// Загрузить изображение
router.post('/image', upload.single('image'), (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Файл не предоставлен' });
    }
    
    const fileInfo = {
      fileName: req.file.filename,
      originalName: req.file.originalname,
      filePath: req.file.path,
      url: `/uploads/images/${req.file.filename}`,
      size: req.file.size,
      mimetype: req.file.mimetype
    };
    
    res.json({
      success: true,
      message: 'Изображение успешно загружено',
      file: fileInfo
    });
  } catch (error) {
    console.error('Ошибка загрузки изображения:', error);
    res.status(500).json({ error: 'Ошибка загрузки изображения' });
  }
});

// Загрузить документ
router.post('/document', upload.single('document'), (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Файл не предоставлен' });
    }
    
    const fileInfo = {
      fileName: req.file.filename,
      originalName: req.file.originalname,
      filePath: req.file.path,
      url: `/uploads/documents/${req.file.filename}`,
      size: req.file.size,
      mimetype: req.file.mimetype
    };
    
    res.json({
      success: true,
      message: 'Документ успешно загружен',
      file: fileInfo
    });
  } catch (error) {
    console.error('Ошибка загрузки документа:', error);
    res.status(500).json({ error: 'Ошибка загрузки документа' });
  }
});

// Удалить файл
router.delete('/file', authenticate, async (req: Request, res: Response) => {
  try {
    const { filePath } = req.body;
    
    if (!filePath) {
      return res.status(400).json({ error: 'Путь к файлу не указан' });
    }
    
    // Проверяем, что файл находится в разрешенных директориях
    const normalizedPath = path.normalize(filePath);
    if (!normalizedPath.startsWith('uploads/')) {
      return res.status(403).json({ error: 'Недопустимый путь к файлу' });
    }
    
    // Проверяем существование файла
    if (!fs.existsSync(normalizedPath)) {
      return res.status(404).json({ error: 'Файл не найден' });
    }
    
    // Удаляем файл
    await unlink(normalizedPath);
    
    res.json({
      success: true,
      message: 'Файл успешно удален'
    });
  } catch (error) {
    console.error('Ошибка удаления файла:', error);
    res.status(500).json({ error: 'Ошибка удаления файла' });
  }
});

// Получить информацию о файле
router.get('/file/:type/:filename', async (req: Request, res: Response) => {
  try {
    const { type, filename } = req.params;
    
    if (!['images', 'documents'].includes(type)) {
      return res.status(400).json({ error: 'Недопустимый тип файла' });
    }
    
    const filePath = path.join('uploads', type, filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Файл не найден' });
    }
    
    const stats = await stat(filePath);
    
    const fileInfo = {
      fileName: filename,
      filePath: filePath,
      url: `/uploads/${type}/${filename}`,
      size: stats.size,
      createdAt: stats.birthtime.toISOString(),
      modifiedAt: stats.mtime.toISOString()
    };
    
    res.json({ file: fileInfo });
  } catch (error) {
    console.error('Ошибка получения информации о файле:', error);
    res.status(500).json({ error: 'Ошибка получения информации о файле' });
  }
});

// Получить статистику медиафайлов
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const imagesPath = 'uploads/images';
    const documentsPath = 'uploads/documents';
    
    let totalImages = 0;
    let totalDocuments = 0;
    let totalSize = 0;
    
    // Подсчитываем изображения
    if (fs.existsSync(imagesPath)) {
      const imageFiles = await readdir(imagesPath);
      totalImages = imageFiles.length;
      
      for (const file of imageFiles) {
        const stats = await stat(path.join(imagesPath, file));
        totalSize += stats.size;
      }
    }
    
    // Подсчитываем документы
    if (fs.existsSync(documentsPath)) {
      const docFiles = await readdir(documentsPath);
      totalDocuments = docFiles.length;
      
      for (const file of docFiles) {
        const stats = await stat(path.join(documentsPath, file));
        totalSize += stats.size;
      }
    }
    
    res.json({
      totalFiles: totalImages + totalDocuments,
      totalImages,
      totalDocuments,
      totalSize,
      totalSizeFormatted: formatFileSize(totalSize)
    });
  } catch (error) {
    console.error('Ошибка получения статистики:', error);
    res.status(500).json({ error: 'Ошибка получения статистики' });
  }
});

// Вспомогательная функция для форматирования размера файла
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default router;
