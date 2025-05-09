import { Router } from 'express';
import { PrismaClient, Prisma } from '@prisma/client'; // <--- Добавьте Prisma здесь
import multer, { FileFilterCallback } from 'multer';
import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();
const router = Router();

// Настройка хранилища для загрузки файлов
const storage = multer.diskStorage({
  destination: function (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) {
    cb(null, 'uploads/news'); // Папка для сохранения файлов
  },
  filename: function (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Ограничение размера файла: 10 MB
});

const coverStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/news/covers'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-cover-${file.originalname}`)
});
const coverUpload = multer({ storage: coverStorage });

const downloadImage = async (url: string, filename: string): Promise<string> => {
  const response = await axios.get(url, { responseType: 'stream' });
  const filePath = path.join('uploads/news', filename);
  await new Promise((resolve, reject) => {
    const stream = response.data.pipe(fs.createWriteStream(filePath));
    stream.on('finish', resolve);
    stream.on('error', reject);
  });
  return `/uploads/news/${filename}`;
};

// Получение списка новостей
router.get('/', async (req, res) => {
  try {
    const news = await prisma.news.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json({ news });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.get('/public', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 6;
    const skip = (page - 1) * limit;
    const news = await prisma.news.findMany({
      where: { isVisible: true },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });
    res.json({ news });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Получение новости по ID
router.get('/:id', async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const news = await prisma.news.findUnique({
      where: { id: parseInt(id, 10) },
    });

    if (!news) {
      res.status(404).json({ error: 'Новость не найдена' });
      return;
    }

    res.json(news);
  } catch (error) {
    console.error('Ошибка при получении новости:', error);
    res.status(500).json({ error: 'Ошибка при получении новости' });
  }
});

// Создание новости с поддержкой cover
router.post('/', async (req, res) => {
  // Получаем coverUrl из тела запроса
  const { title, content, htmlContent, coverUrl, mediaUrls } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: 'Заголовок и содержание обязательны' });
  }

  try {
    const news = await prisma.news.create({
      data: {
        title,
        content,
        htmlContent: htmlContent || '',
        // Сохраняем ссылку на обложку напрямую
        cover: coverUrl || null,
        // Сохраняем массив ссылок на медиа
        media: JSON.stringify(mediaUrls || []),
      },
    });
    res.status(201).json(news);
  } catch (error) {
    console.error('Ошибка при создании новости:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Обновление новости
router.put('/:id', upload.array('media', 10), coverUpload.single('cover'), async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  const { id } = req.params;
  const { title, content, htmlContent, coverUrl } = req.body;

  const media = Array.isArray(req.files)
    ? (req.files as Express.Multer.File[]).map((file) => `/uploads/news/${file.filename}`)
    : [];

  let coverPath = coverUrl || '';
  if (req.file) {
    coverPath = `/uploads/news/covers/${req.file.filename}`;
  }

  try {
    const news = await prisma.news.update({
      where: { id: parseInt(id, 10) },
      data: {
        title,
        content,
        htmlContent,
        media: JSON.stringify(media),
        cover: coverPath || null,
      },
    });
    res.status(200).json(news);
  } catch (error) {
    console.error('Ошибка при обновлении новости:', error);
    res.status(500).json({ error: 'Ошибка при обновлении новости' });
  }
});

// Удаление новости
router.delete('/:id', async (req: Request<{ id: string }>, res: Response) => {
  const { id } = req.params; // Убедитесь, что id извлекается здесь или выше
  try {
    await prisma.news.delete({
      where: { id: parseInt(id, 10) },
    });
    res.status(204).send();
  } catch (error) {
    console.error('Ошибка при удалении новости:', error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        // Теперь return здесь не вызывает конфликта типов с сигнатурой функции
        return res.status(404).json({ error: 'Новость не найдена' });
      }
    }
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Переключение видимости новости
router.patch('/:id/toggle-visibility', async (req, res): Promise<void> => {
  const { id } = req.params;
  try {
    const newsItem = await prisma.news.findUnique({ where: { id: parseInt(id, 10) } });
    if (!newsItem) {
      res.status(404).json({ error: 'Новость не найдена' });
      return;
    }
    const updatedNews = await prisma.news.update({
      where: { id: parseInt(id, 10) },
      data: { isVisible: !newsItem.isVisible },
    });
    res.json(updatedNews);
  } catch (error) {
    console.error('Ошибка при переключении видимости:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.post('/upload-by-url', async (req, res) => {
  const { url, type } = req.body; // type: 'cover' или 'media'
  if (!url) return res.status(400).json({ error: 'Нет ссылки' });

  try {
    const response = await axios.get(url, { responseType: 'stream' });
    const ext = path.extname(url).split('?')[0] || '.jpg';
    const filename = `${Date.now()}-${type}${ext}`;
    const uploadPath = path.join(__dirname, '../../uploads/news', filename);
    const writer = fs.createWriteStream(uploadPath);

    response.data.pipe(writer);

    writer.on('finish', () => {
      res.json({ path: `/uploads/news/${filename}` });
    });
    writer.on('error', () => {
      res.status(500).json({ error: 'Ошибка сохранения файла' });
    });
  } catch (e) {
    res.status(500).json({ error: 'Ошибка загрузки по ссылке' });
  }
});

export default router;