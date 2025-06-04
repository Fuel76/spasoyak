import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Получить все категории
router.get('/', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { news: true }
        }
      },
      orderBy: [
        { order: 'asc' },
        { name: 'asc' }
      ]
    });
    res.json(categories);
  } catch (error) {
    console.error('Ошибка при получении категорий:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Получить категорию по ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const category = await prisma.category.findUnique({
      where: { id: parseInt(id) },
      include: {
        news: {
          where: { isVisible: true },
          orderBy: { publishedAt: 'desc' },
          take: 10
        }
      }
    });
    
    if (!category) {
      return res.status(404).json({ error: 'Категория не найдена' });
    }
    
    res.json(category);
  } catch (error) {
    console.error('Ошибка при получении категории:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Создать новую категорию
router.post('/', async (req, res) => {
  try {
    const { name, description, slug, color, icon, order } = req.body;
    
    if (!name || !slug) {
      return res.status(400).json({ error: 'Название и slug обязательны' });
    }
    
    const category = await prisma.category.create({
      data: {
        name,
        description,
        slug,
        color,
        icon,
        order: order || 0
      }
    });
    
    res.status(201).json(category);
  } catch (error: any) {
    console.error('Ошибка при создании категории:', error);
    if (error.code === 'P2002') {
      res.status(400).json({ error: 'Категория с таким названием или slug уже существует' });
    } else {
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  }
});

// Обновить категорию
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, slug, color, icon, order, isVisible } = req.body;
    
    const category = await prisma.category.update({
      where: { id: parseInt(id) },
      data: {
        name,
        description,
        slug,
        color,
        icon,
        order,
        isVisible
      }
    });
    
    res.json(category);
  } catch (error: any) {
    console.error('Ошибка при обновлении категории:', error);
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Категория не найдена' });
    } else if (error.code === 'P2002') {
      res.status(400).json({ error: 'Категория с таким названием или slug уже существует' });
    } else {
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  }
});

// Удалить категорию
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Проверяем, есть ли новости в этой категории
    const newsCount = await prisma.news.count({
      where: { categoryId: parseInt(id) }
    });
    
    if (newsCount > 0) {
      return res.status(400).json({ 
        error: 'Нельзя удалить категорию, в которой есть новости',
        newsCount 
      });
    }
    
    await prisma.category.delete({
      where: { id: parseInt(id) }
    });
    
    res.json({ message: 'Категория удалена' });
  } catch (error: any) {
    console.error('Ошибка при удалении категории:', error);
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Категория не найдена' });
    } else {
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  }
});

export default router;
