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
    const { 
      page = 1, 
      limit = 10, 
      category, 
      tag, 
      search,
      sortBy = 'publishedAt',
      order = 'desc'
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Условия фильтрации
    const where: any = {
      isVisible: true
    };

    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { excerpt: { contains: search as string, mode: 'insensitive' } },
        { content: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    if (category) {
      where.categoryId = parseInt(category as string);
    }

    if (tag) {
      where.tags = {
        some: {
          tag: {
            slug: tag as string
          }
        }
      };
    }

    const [news, total] = await Promise.all([
      prisma.news.findMany({
        where,
        include: {
          category: true,
          author: {
            select: { id: true, name: true, email: true }
          },
          tags: {
            include: {
              tag: true
            }
          },
          _count: {
            select: { tags: true }
          }
        },
        orderBy: { [sortBy as string]: order },
        skip,
        take: limitNum
      }),
      prisma.news.count({ where })
    ]);

    res.json({
      news,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalItems: total,
        itemsPerPage: limitNum
      }
    });
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
    console.error('Ошибка в /public роуте:', error);
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

// Получение новости по slug
router.get('/slug/:slug', async (req: Request<{ slug: string }>, res: Response): Promise<void> => {
  const { slug } = req.params;

  try {
    const news = await prisma.news.findUnique({
      where: { slug },
      include: {
        category: true,
        author: {
          select: { id: true, name: true, email: true }
        },
        tags: {
          include: {
            tag: true
          }
        }
      }
    });

    if (!news) {
      res.status(404).json({ error: 'Новость не найдена' });
      return;
    }

    res.json(news);
  } catch (error) {
    console.error('Ошибка при получении новости по slug:', error);
    res.status(500).json({ error: 'Ошибка при получении новости' });
  }
});

// Увеличение счетчика просмотров для новости по slug
router.post('/slug/:slug/view', async (req: Request<{ slug: string }>, res: Response): Promise<void> => {
  const { slug } = req.params;

  try {
    const news = await prisma.news.update({
      where: { slug },
      data: {
        viewCount: {
          increment: 1
        }
      }
    });

    res.json({ viewCount: news.viewCount });
  } catch (error) {
    console.error('Ошибка при увеличении счетчика просмотров:', error);
    res.status(500).json({ error: 'Ошибка при увеличении счетчика просмотров' });
  }
});

// Создание новости с поддержкой cover, категорий и тегов
router.post('/', async (req, res) => {
  const { 
    title, 
    content, 
    htmlContent, 
    excerpt,
    coverUrl, 
    mediaUrls, 
    customCss,
    categoryId,
    tagIds = [],
    authorId,
    publishedAt,
    metaTitle,
    metaDescription,
    slug,
    isPinned = false,
    headerStyle = 'default',
    headerColor = '#f8f9fa'
  } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: 'Заголовок и содержание обязательны' });
  }

  try {
    // Создаем slug если не передан
    const newsSlug = slug || title.toLowerCase()
      .replace(/[^а-яё\w\s-]/gi, '')
      .replace(/\s+/g, '-')
      .substring(0, 255);

    const news = await prisma.news.create({
      data: {
        title,
        content,
        htmlContent: htmlContent || '',
        excerpt,
        cover: coverUrl || null,
        media: JSON.stringify(mediaUrls || []),
        customCss: customCss || null,
        headerStyle,
        headerColor,
        categoryId: categoryId ? parseInt(categoryId) : null,
        authorId: authorId ? parseInt(authorId) : null,
        publishedAt: publishedAt ? new Date(publishedAt) : new Date(),
        metaTitle,
        metaDescription,
        slug: newsSlug,
        isPinned,
        tags: {
          create: tagIds.map((tagId: number) => ({
            tag: { connect: { id: tagId } }
          }))
        }
      },
      include: {
        category: true,
        author: {
          select: { id: true, name: true, email: true }
        },
        tags: {
          include: {
            tag: true
          }
        }
      }
    });
    res.status(201).json(news);
  } catch (error: any) {
    console.error('Ошибка при создании новости:', error);
    if (error.code === 'P2002') {
      res.status(400).json({ error: 'Новость с таким slug уже существует' });
    } else {
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  }
});

// Обновление новости с поддержкой категорий и тегов
router.put('/:id', async (req: Request<{ id: string }>, res: Response) => {
  const { id } = req.params;
  const { 
    title, 
    content, 
    htmlContent, 
    excerpt,
    coverUrl, 
    mediaUrls,
    customCss,
    categoryId,
    tagIds = [],
    authorId,
    publishedAt,
    metaTitle,
    metaDescription,
    slug,
    isPinned,
    isVisible,
    headerStyle = 'default',
    headerColor = '#f8f9fa'
  } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Заголовок обязателен' });
  }

  try {
    // Сначала удаляем старые связи с тегами
    await prisma.newsTag.deleteMany({
      where: { newsId: parseInt(id, 10) }
    });

    const news = await prisma.news.update({
      where: { id: parseInt(id, 10) },
      data: {
        title,
        content,
        htmlContent,
        excerpt,
        cover: coverUrl || null,
        media: JSON.stringify(mediaUrls || []),
        customCss: customCss || null,
        headerStyle,
        headerColor,
        categoryId: categoryId ? parseInt(categoryId) : null,
        authorId: authorId ? parseInt(authorId) : null,
        publishedAt: publishedAt ? new Date(publishedAt) : undefined,
        metaTitle,
        metaDescription,
        slug,
        isPinned,
        isVisible,
        tags: {
          create: tagIds.map((tagId: number) => ({
            tag: { connect: { id: tagId } }
          }))
        }
      },
      include: {
        category: true,
        author: {
          select: { id: true, name: true, email: true }
        },
        tags: {
          include: {
            tag: true
          }
        }
      }
    });
    res.status(200).json(news);
  } catch (error: any) {
    console.error('Ошибка при обновлении новости:', error);
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Новость не найдена' });
    } else if (error.code === 'P2002') {
      res.status(400).json({ error: 'Новость с таким slug уже существует' });
    } else {
      res.status(500).json({ error: 'Ошибка при обновлении новости' });
    }
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

// Получение новости по slug
router.get('/slug/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    
    const news = await prisma.news.findFirst({
      where: {
        slug,
        isVisible: true
      },
      include: {
        category: true,
        author: {
          select: { id: true, name: true, email: true }
        },
        tags: {
          include: {
            tag: true
          }
        }
      }
    });

    if (!news) {
      return res.status(404).json({ error: 'Новость не найдена' });
    }

    res.json(news);
  } catch (error) {
    console.error('Ошибка при получении новости по slug:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Увеличение счетчика просмотров по slug
router.post('/slug/:slug/view', async (req, res) => {
  try {
    const { slug } = req.params;
    
    const news = await prisma.news.findFirst({
      where: {
        slug,
        isVisible: true
      }
    });

    if (!news) {
      return res.status(404).json({ error: 'Новость не найдена' });
    }

    const updatedNews = await prisma.news.update({
      where: { id: news.id },
      data: {
        viewCount: {
          increment: 1
        }
      }
    });

    res.json({ success: true, viewCount: updatedNews.viewCount });
  } catch (error) {
    console.error('Ошибка при увеличении счетчика просмотров:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export default router;