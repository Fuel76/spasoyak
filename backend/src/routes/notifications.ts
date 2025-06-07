import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Функция для отправки уведомления (заглушка)
async function sendNotificationMessage(notification: any): Promise<boolean> {
  // Здесь будет логика отправки уведомлений через разные каналы
  console.log(`Sending ${notification.type} notification:`, notification.message);
  
  // Имитация отправки
  return Math.random() > 0.1; // 90% успешных отправок
}

// Получить все уведомления
router.get('/', async (req, res) => {
  try {
    const { 
      status, 
      type,
      userId, 
      trebaId,
      page = 1, 
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const where: any = {};
    
    if (status) where.status = status;
    if (type) where.type = type;
    if (userId) where.userId = Number(userId);
    if (trebaId) where.trebaId = Number(trebaId);

    const notifications = await prisma.notification.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        treba: {
          select: { 
            id: true, 
            type: true, 
            status: true,
            names: {
              select: { name: true }
            }
          }
        },
      },
      orderBy: { [sortBy as string]: sortOrder },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
    });

    const total = await prisma.notification.count({ where });

    res.json({
      data: notifications,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching Notifications:', error);
    res.status(500).json({ error: 'Ошибка при получении уведомлений' });
  }
});

// Получить уведомление по ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await prisma.notification.findUnique({
      where: { id: Number(id) },
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true }
        },
        treba: {
          include: {
            names: true,
            statusHistory: {
              orderBy: { changedAt: 'desc' },
              take: 5
            }
          }
        },
      },
    });

    if (!notification) {
      return res.status(404).json({ error: 'Уведомление не найдено' });
    }

    res.json(notification);
  } catch (error) {
    console.error('Error fetching Notification:', error);
    res.status(500).json({ error: 'Ошибка при получении уведомления' });
  }
});

// Создать новое уведомление
router.post('/', async (req, res) => {
  try {
    const { 
      userId, 
      trebaId, 
      type, 
      message,
      sendImmediately = false
    } = req.body;

    if (!type || !message) {
      return res.status(400).json({ 
        error: 'Отсутствуют обязательные поля: type, message' 
      });
    }

    const notification = await prisma.notification.create({
      data: {
        userId: userId || null,
        trebaId: trebaId || null,
        type: type as any,
        message,
        status: 'PENDING',
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true }
        },
        treba: {
          select: { id: true, type: true, status: true }
        },
      }
    });

    // Если нужно отправить немедленно
    if (sendImmediately) {
      try {
        const success = await sendNotificationMessage(notification);
        
        await prisma.notification.update({
          where: { id: notification.id },
          data: {
            status: success ? 'SENT' : 'FAILED',
            sentAt: success ? new Date() : null,
          }
        });
        
        notification.status = success ? 'SENT' : 'FAILED';
        notification.sentAt = success ? new Date() : null;
      } catch (sendError) {
        console.error('Error sending notification:', sendError);
        
        await prisma.notification.update({
          where: { id: notification.id },
          data: { status: 'FAILED' }
        });
        
        notification.status = 'FAILED';
      }
    }

    res.status(201).json(notification);
  } catch (error) {
    console.error('Error creating Notification:', error);
    res.status(500).json({ error: 'Ошибка при создании уведомления' });
  }
});

// Отправить уведомление
router.post('/:id/send', async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await prisma.notification.findUnique({
      where: { id: Number(id) },
      include: {
        user: true,
        treba: true,
      }
    });

    if (!notification) {
      return res.status(404).json({ error: 'Уведомление не найдено' });
    }

    if (notification.status === 'SENT') {
      return res.status(400).json({ 
        error: 'Уведомление уже отправлено' 
      });
    }

    try {
      const success = await sendNotificationMessage(notification);
      
      const updatedNotification = await prisma.notification.update({
        where: { id: Number(id) },
        data: {
          status: success ? 'SENT' : 'FAILED',
          sentAt: success ? new Date() : null,
        }
      });

      res.json({
        ...updatedNotification,
        success,
        message: success ? 'Уведомление отправлено' : 'Ошибка при отправке'
      });
    } catch (sendError) {
      console.error('Error sending notification:', sendError);
      
      const failedNotification = await prisma.notification.update({
        where: { id: Number(id) },
        data: { status: 'FAILED' }
      });

      res.status(500).json({
        ...failedNotification,
        success: false,
        message: 'Ошибка при отправке уведомления'
      });
    }
  } catch (error) {
    console.error('Error sending Notification:', error);
    res.status(500).json({ error: 'Ошибка при отправке уведомления' });
  }
});

// Отправить массовые уведомления
router.post('/bulk-send', async (req, res) => {
  try {
    const { 
      userIds = [], 
      trebaIds = [], 
      type, 
      message,
      filters = {}
    } = req.body;

    if (!type || !message) {
      return res.status(400).json({ 
        error: 'Отсутствуют обязательные поля: type, message' 
      });
    }

    // Определяем получателей
    const where: any = {};
    
    if (userIds.length > 0) {
      where.userId = { in: userIds.map(Number) };
    }
    
    if (trebaIds.length > 0) {
      where.trebaId = { in: trebaIds.map(Number) };
    }

    // Добавляем дополнительные фильтры
    if (filters.userRole) {
      where.user = { role: filters.userRole };
    }
    
    if (filters.trebaStatus) {
      where.treba = { status: filters.trebaStatus };
    }

    // Создаем уведомления для пользователей
    const usersToNotify = await prisma.user.findMany({
      where: userIds.length > 0 ? { id: { in: userIds.map(Number) } } : {},
      select: { id: true }
    });

    const notifications = await Promise.all(
      usersToNotify.map(user => 
        prisma.notification.create({
          data: {
            userId: user.id,
            trebaId: null,
            type: type as any,
            message,
            status: 'PENDING',
          }
        })
      )
    );

    // Отправляем уведомления
    const results = await Promise.all(
      notifications.map(async notification => {
        try {
          const success = await sendNotificationMessage(notification);
          
          await prisma.notification.update({
            where: { id: notification.id },
            data: {
              status: success ? 'SENT' : 'FAILED',
              sentAt: success ? new Date() : null,
            }
          });
          
          return { id: notification.id, success };
        } catch (error) {
          await prisma.notification.update({
            where: { id: notification.id },
            data: { status: 'FAILED' }
          });
          
          return { id: notification.id, success: false };
        }
      })
    );

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    res.json({
      total: notifications.length,
      successful,
      failed,
      results
    });
  } catch (error) {
    console.error('Error sending bulk notifications:', error);
    res.status(500).json({ error: 'Ошибка при массовой отправке уведомлений' });
  }
});

// Получить шаблоны уведомлений
router.get('/templates', async (req, res) => {
  try {
    const templates = [
      {
        id: 'treba_created',
        name: 'Треба создана',
        type: 'EMAIL',
        template: 'Ваша треба "{{trebaType}}" принята к исполнению. Номер заявки: {{trebaId}}',
        variables: ['trebaType', 'trebaId']
      },
      {
        id: 'treba_paid',
        name: 'Треба оплачена',
        type: 'EMAIL',
        template: 'Оплата за требу "{{trebaType}}" успешно получена. Сумма: {{amount}} {{currency}}',
        variables: ['trebaType', 'amount', 'currency']
      },
      {
        id: 'treba_completed',
        name: 'Треба исполнена',
        type: 'EMAIL',
        template: 'Ваша треба "{{trebaType}}" исполнена {{date}}',
        variables: ['trebaType', 'date']
      },
      {
        id: 'payment_reminder',
        name: 'Напоминание об оплате',
        type: 'EMAIL',
        template: 'Напоминаем об оплате требы "{{trebaType}}". Сумма к оплате: {{amount}} {{currency}}',
        variables: ['trebaType', 'amount', 'currency']
      }
    ];

    res.json(templates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ error: 'Ошибка при получении шаблонов' });
  }
});

// Получить статистику уведомлений
router.get('/stats/summary', async (req, res) => {
  try {
    const { 
      startDate, 
      endDate, 
      userId 
    } = req.query;

    const where: any = {};
    
    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string),
      };
    }
    
    if (userId) {
      where.userId = Number(userId);
    }

    const [
      totalNotifications,
      sentNotifications,
      pendingNotifications,
      failedNotifications,
      byType
    ] = await Promise.all([
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { ...where, status: 'SENT' } }),
      prisma.notification.count({ where: { ...where, status: 'PENDING' } }),
      prisma.notification.count({ where: { ...where, status: 'FAILED' } }),
      prisma.notification.groupBy({
        by: ['type'],
        where,
        _count: { type: true }
      })
    ]);

    res.json({
      summary: {
        total: totalNotifications,
        sent: sentNotifications,
        pending: pendingNotifications,
        failed: failedNotifications,
      },
      byType: byType.reduce((acc, item) => {
        acc[item.type] = item._count.type;
        return acc;
      }, {} as Record<string, number>)
    });
  } catch (error) {
    console.error('Error fetching Notification stats:', error);
    res.status(500).json({ error: 'Ошибка при получении статистики' });
  }
});

export default router;
