import express from 'express';
import { PrismaClient, ServiceType, ServicePriority } from '@prisma/client';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { parseDateSafe } from '../utils/dateUtils';

const router = express.Router();
const prisma = new PrismaClient();

// Получить расписание
router.get('/', async (req, res) => {
  try {
    const { date, month, year } = req.query;
    
    let whereClause: any = { isVisible: true };
    
    if (date) {
      whereClause.date = parseDateSafe(date as string);
    } else if (month && year) {
      const startDate = new Date(parseInt(year as string), parseInt(month as string) - 1, 1);
      const endDate = new Date(parseInt(year as string), parseInt(month as string), 0);
      whereClause.date = {
        gte: startDate,
        lte: endDate
      };
    }

    const schedules = await prisma.schedule.findMany({
      where: whereClause,
      include: {
        calendarDay: {
          include: {
            saints: true,
            readings: true
          }
        }
      },
      orderBy: [
        { date: 'asc' },
        { priority: 'desc' },
        { time: 'asc' }
      ]
    });

    res.json(schedules);
  } catch (e) {
    console.error('Error fetching schedule:', e);
    res.status(500).json({ error: 'Ошибка чтения расписания' });
  }
});

// Создать новую запись расписания
router.post('/', authenticateToken, authorizeRoles(['admin']), async (req, res) => {
  try {
    const { date, time, title, description, type, priority, calendarDayId } = req.body;
    
    const schedule = await prisma.schedule.create({
      data: {
        date: parseDateSafe(date),
        time,
        title,
        description,
        type: type || ServiceType.REGULAR,
        priority: priority || ServicePriority.NORMAL,
        calendarDayId
      },
      include: {
        calendarDay: true
      }
    });

    res.json(schedule);
  } catch (e) {
    console.error('Error creating schedule:', e);
    res.status(500).json({ error: 'Ошибка создания записи расписания' });
  }
});

// Обновить запись расписания
router.put('/:id', authenticateToken, authorizeRoles(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { date, time, title, description, type, priority, isVisible, calendarDayId } = req.body;
    
    const schedule = await prisma.schedule.update({
      where: { id: parseInt(id) },
      data: {
        date: date ? parseDateSafe(date) : undefined,
        time,
        title,
        description,
        type,
        priority,
        isVisible,
        calendarDayId
      },
      include: {
        calendarDay: true
      }
    });

    res.json(schedule);
  } catch (e) {
    console.error('Error updating schedule:', e);
    res.status(500).json({ error: 'Ошибка обновления записи расписания' });
  }
});

// Удалить запись расписания
router.delete('/:id', authenticateToken, authorizeRoles(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.schedule.delete({
      where: { id: parseInt(id) }
    });

    res.json({ success: true });
  } catch (e) {
    console.error('Error deleting schedule:', e);
    res.status(500).json({ error: 'Ошибка удаления записи расписания' });
  }
});

export default router;
