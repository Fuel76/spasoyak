import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, isAdmin } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

/**
 * Получение статистики для админской панели
 * GET /api/stats
 */
router.get('/', authenticateToken, isAdmin, async (req, res) => {
  try {
    // Получаем статистику из базы данных
    const [
      totalPages,
      totalNews,
      totalCategories, 
      totalTags,
      pendingTreby,
      totalTreby,
      totalUsers
    ] = await Promise.all([
      prisma.page.count(),
      prisma.news.count(),
      prisma.category.count(),
      prisma.tag.count(),
      prisma.treba.count({ where: { paymentStatus: 'pending' } }),
      prisma.treba.count(),
      prisma.user.count()
    ]);

    const stats = {
      totalPages,
      totalNews,
      totalCategories,
      totalTags,
      pendingTreby,
      totalTreby,
      totalUsers
    };

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Ошибка при получении статистики:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка при получении статистики'
    });
  }
});

/**
 * Получение детальной статистики пользователей
 * GET /api/stats/users
 */
router.get('/users', authenticateToken, isAdmin, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      users
    });
  } catch (error) {
    console.error('Ошибка при получении пользователей:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка при получении пользователей'
    });
  }
});

/**
 * Получение активности системы
 * GET /api/stats/activity
 */
router.get('/activity', authenticateToken, isAdmin, async (req, res) => {
  try {
    // Статистика по последним активностям
    const [
      recentNews,
      recentTreby,
      recentPages
    ] = await Promise.all([
      prisma.news.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          createdAt: true,
          author: {
            select: {
              name: true,
              email: true
            }
          }
        }
      }),
      prisma.treba.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          type: true,
          names: true,
          createdAt: true,
          paymentStatus: true
        }
      }),
      prisma.page.findMany({
        take: 5,
        orderBy: { updatedAt: 'desc' },
        select: {
          id: true,
          title: true,
          slug: true,
          updatedAt: true
        }
      })
    ]);

    res.json({
      success: true,
      activity: {
        recentNews,
        recentTreby,
        recentPages
      }
    });
  } catch (error) {
    console.error('Ошибка при получении активности:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка при получении активности'
    });
  }
});

export default router;
