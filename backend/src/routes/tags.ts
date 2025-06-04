import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Получить все теги
router.get('/', async (req, res) => {
  try {
    const tags = await prisma.tag.findMany({
      include: {
        _count: {
          select: { news: true }
        }
      },
      orderBy: { name: 'asc' }
    });
    res.json(tags);
  } catch (error: any) {
    console.error('Ошибка при получении тегов:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Получить тег по ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const tag = await prisma.tag.findUnique({
      where: { id: parseInt(id) },
      include: {
        news: {
          include: {
            news: {
              select: {
                id: true,
                title: true,
                excerpt: true,
                cover: true,
                publishedAt: true,
                slug: true,
                isVisible: true
              }
            }
          }
        }
      }
    });
    
    if (!tag) {
      return res.status(404).json({ error: 'Тег не найден' });
    }
    
    res.json(tag);
  } catch (error: any) {
    console.error('Ошибка при получении тега:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Создать новый тег
router.post('/', async (req, res) => {
  try {
    const { name, slug, color, description } = req.body;
    
    if (!name || !slug) {
      return res.status(400).json({ error: 'Название и slug обязательны' });
    }
    
    const tag = await prisma.tag.create({
      data: {
        name,
        slug,
        color,
        description
      }
    });
    
    res.status(201).json(tag);
  } catch (error: any) {
    console.error('Ошибка при создании тега:', error);
    if (error.code === 'P2002') {
      res.status(400).json({ error: 'Тег с таким названием или slug уже существует' });
    } else {
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  }
});

// Обновить тег
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, color, description, isVisible } = req.body;
    
    const tag = await prisma.tag.update({
      where: { id: parseInt(id) },
      data: {
        name,
        slug,
        color,
        description,
        isVisible
      }
    });
    
    res.json(tag);
  } catch (error: any) {
    console.error('Ошибка при обновлении тега:', error);
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Тег не найден' });
    } else if (error.code === 'P2002') {
      res.status(400).json({ error: 'Тег с таким названием или slug уже существует' });
    } else {
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  }
});

// Удалить тег
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Сначала удаляем связи с новостями
    await prisma.newsTag.deleteMany({
      where: { tagId: parseInt(id) }
    });
    
    // Затем удаляем сам тег
    await prisma.tag.delete({
      where: { id: parseInt(id) }
    });
    
    res.json({ message: 'Тег удален' });
  } catch (error: any) {
    console.error('Ошибка при удалении тега:', error);
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Тег не найден' });
    } else {
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  }
});

// Поиск тегов по названию
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const tags = await prisma.tag.findMany({
      where: {
        name: {
          contains: query
        },
        isVisible: true
      },
      take: 10,
      orderBy: { name: 'asc' }
    });
    res.json(tags);
  } catch (error: any) {
    console.error('Ошибка при поиске тегов:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export default router;
