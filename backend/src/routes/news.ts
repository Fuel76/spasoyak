import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import { Request, Response } from 'express';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();
const router = Router();

// Настройка хранилища для загрузки файлов
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/news'); // Папка для сохранения файлов
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Ограничение размера файла: 10 MB
});

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
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const news = await prisma.news.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(news);
  } catch (error) {
    console.error('Ошибка при получении списка новостей:', error);
    res.status(500).json({ error: 'Ошибка при получении списка новостей' });
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

// Создание новости
router.post('/', upload.array('media', 10), async (req: Request, res: Response): Promise<void> => {
  const { title, content, htmlContent } = req.body;

  if (!title || !content) {
    res.status(400).json({ error: 'Заголовок и содержание обязательны' });
    return;
  }

  const media = Array.isArray(req.files)
    ? (req.files as Express.Multer.File[]).map((file) => `/uploads/news/${file.filename}`)
    : [];

  // Обработка изображений из HTML-контента
  const imageUrls: string[] = [];
  const imageRegex = /<img[^>]+src="([^">]+)"/g;
  let match;
  while ((match = imageRegex.exec(htmlContent)) !== null) {
    const imageUrl = match[1];
    if (imageUrl.startsWith('http')) {
      const filename = `${Date.now()}-${path.basename(imageUrl)}`;
      const localPath = await downloadImage(imageUrl, filename);
      imageUrls.push(localPath);
    }
  }

  try {
    const news = await prisma.news.create({
      data: {
        title,
        content,
        htmlContent,
        media: JSON.stringify([...media, ...imageUrls]), // Сохраняем пути к файлам как JSON
      },
    });
    res.status(201).json(news);
  } catch (error) {
    console.error('Ошибка при создании новости:', error);
    res.status(500).json({ error: 'Ошибка при создании новости' });
  }
});

// Обновление новости
router.put('/:id', upload.array('media', 10), async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  const { id } = req.params;
  const { title, content, htmlContent } = req.body;

  // Проверяем, что req.files является массивом
  const media = Array.isArray(req.files)
    ? (req.files as Express.Multer.File[]).map((file) => `/uploads/news/${file.filename}`)
    : [];

  try {
    const news = await prisma.news.update({
      where: { id: parseInt(id, 10) },
      data: {
        title,
        content,
        htmlContent,
        media: JSON.stringify(media), // Сохраняем пути к файлам как JSON
      },
    });
    res.status(200).json(news);
  } catch (error) {
    console.error('Ошибка при обновлении новости:', error);
    res.status(500).json({ error: 'Ошибка при обновлении новости' });
  }
});

// Удаление новости
router.delete('/:id', async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    await prisma.news.delete({
      where: { id: parseInt(id, 10) },
    });
    res.status(204).send();
  } catch (error) {
    console.error('Ошибка при удалении новости:', error);
    res.status(500).json({ error: 'Ошибка при удалении новости' });
  }
});

export default router;