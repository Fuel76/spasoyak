import { Router, Request, Response } from 'express';
import { PrismaClient, DayPriority, FastingType, SaintPriority, ReadingType } from '@prisma/client';
import { parseDateSafe, parseDateUTC, formatCalendarDayForResponse } from '../utils/dateUtils';

const router = Router();
const prisma = new PrismaClient();

// Получить календарный день с данными
router.get('/:date', async (req: Request, res: Response) => {
  try {
    const { date } = req.params;
    
    // Пробуем найти запись сначала новым способом (локальное время), потом старым (UTC)
    let calendarDay = await prisma.calendarDay.findUnique({
      where: { date: parseDateSafe(date) },
      include: {
        saints: true,
        readings: {
          orderBy: { order: 'asc' }
        },
        schedules: {
          where: { isVisible: true },
          orderBy: [
            { priority: 'desc' },
            { time: 'asc' }
          ]
        }
      }
    });

    // Если не нашли новым способом, пробуем старым (для совместимости)
    if (!calendarDay) {
      calendarDay = await prisma.calendarDay.findUnique({
        where: { date: parseDateUTC(date) },
        include: {
          saints: true,
          readings: {
            orderBy: { order: 'asc' }
          },
          schedules: {
            where: { isVisible: true },
            orderBy: [
              { priority: 'desc' },
              { time: 'asc' }
            ]
          }
        }
      });
    }

    if (!calendarDay) {
      // Проверяем, есть ли запись с похожей датой (в пределах суток)
      const searchDate = parseDateSafe(date);
      const startOfDay = new Date(searchDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(searchDate);
      endOfDay.setHours(23, 59, 59, 999);
      
      // Ищем любую запись в пределах этого дня
      const existingDay = await prisma.calendarDay.findFirst({
        where: {
          date: {
            gte: new Date(startOfDay.getTime() - 24 * 60 * 60 * 1000), // -1 день
            lte: new Date(endOfDay.getTime() + 24 * 60 * 60 * 1000)    // +1 день
          }
        },
        include: {
          saints: true,
          readings: {
            orderBy: { order: 'asc' }
          },
          schedules: {
            where: { isVisible: true },
            orderBy: [
              { priority: 'desc' },
              { time: 'asc' }
            ]
          }
        }
      });
      
      if (existingDay) {
        // Нашли похожую запись, возвращаем её с правильной датой
        return res.json(formatCalendarDayForResponse(existingDay));
      }
      
      // Создаем новую запись только если не нашли никакой похожей
      try {
        const newDay = await prisma.calendarDay.create({
          data: {
            date: parseDateSafe(date)
          },
          include: {
            saints: true,
            readings: true,
            schedules: true
          }
        });
        return res.json(formatCalendarDayForResponse(newDay));
      } catch (error: any) {
        // Если всё равно ошибка уникального ключа, возвращаем пустой объект
        if (error.code === 'P2002') {
          return res.json({
            date: date,
            priority: 'NORMAL',
            fastingType: 'NONE',
            isHoliday: false,
            saints: [],
            readings: [],
            schedules: []
          });
        }
        throw error;
      }
    }

    res.json(formatCalendarDayForResponse(calendarDay));
  } catch (error) {
    console.error('Error fetching calendar day:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Получить календарь за месяц
router.get('/month/:year/:month', async (req: Request, res: Response) => {
  try {
    const { year, month } = req.params;
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0);

    const calendarDays = await prisma.calendarDay.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        saints: true,
        readings: {
          orderBy: { order: 'asc' }
        },
        schedules: {
          where: { isVisible: true },
          orderBy: [
            { priority: 'desc' },
            { time: 'asc' }
          ]
        }
      },
      orderBy: { date: 'asc' }
    });

    res.json(calendarDays.map(formatCalendarDayForResponse));
  } catch (error) {
    console.error('Error fetching month calendar:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Обновить календарный день
router.put('/:date', async (req: Request, res: Response) => {
  try {
    const { date } = req.params;
    const { priority, fastingType, isHoliday, color, note } = req.body;

    const calendarDay = await prisma.calendarDay.upsert({
      where: { date: parseDateSafe(date) },
      update: {
        priority,
        fastingType,
        isHoliday,
        color,
        note
      },
      create: {
        date: parseDateSafe(date),
        priority,
        fastingType,
        isHoliday,
        color,
        note
      },
      include: {
        saints: true,
        readings: true,
        schedules: true
      }
    });

    res.json(calendarDay);
  } catch (error) {
    console.error('Error updating calendar day:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Добавить святого к дню
router.post('/:date/saints', async (req: Request, res: Response) => {
  try {
    const { date } = req.params;
    const { name, description, icon, priority } = req.body;

    // Найти или создать календарный день
    let calendarDay = await prisma.calendarDay.findUnique({
      where: { date: parseDateSafe(date) }
    });

    if (!calendarDay) {
      calendarDay = await prisma.calendarDay.create({
        data: { date: parseDateSafe(date) }
      });
    }

    // Создать святого
    const saint = await prisma.saint.create({
      data: {
        name,
        description,
        icon,
        priority: priority || SaintPriority.COMMEMORATED,
        calendarDays: {
          connect: { id: calendarDay.id }
        }
      }
    });

    res.json(saint);
  } catch (error) {
    console.error('Error adding saint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Добавить чтение к дню
router.post('/:date/readings', async (req: Request, res: Response) => {
  try {
    const { date } = req.params;
    const { type, reference, title, text, order } = req.body;

    // Найти или создать календарный день
    let calendarDay = await prisma.calendarDay.findUnique({
      where: { date: parseDateSafe(date) }
    });

    if (!calendarDay) {
      calendarDay = await prisma.calendarDay.create({
        data: { date: parseDateSafe(date) }
      });
    }

    // Создать чтение
    const reading = await prisma.reading.create({
      data: {
        type,
        reference,
        title,
        text,
        order: order || 0,
        calendarDays: {
          connect: { id: calendarDay.id }
        }
      }
    });

    res.json(reading);
  } catch (error) {
    console.error('Error adding reading:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Удалить святого
router.delete('/saints/:saintId', async (req: Request, res: Response) => {
  try {
    const { saintId } = req.params;
    await prisma.saint.delete({
      where: { id: parseInt(saintId) }
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting saint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Удалить чтение
router.delete('/readings/:readingId', async (req: Request, res: Response) => {
  try {
    const { readingId } = req.params;
    await prisma.reading.delete({
      where: { id: parseInt(readingId) }
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting reading:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Получить все святых
router.get('/admin/saints', async (req: Request, res: Response) => {
  try {
    const saints = await prisma.saint.findMany({
      include: {
        calendarDays: true
      },
      orderBy: { name: 'asc' }
    });
    res.json(saints);
  } catch (error) {
    console.error('Error fetching saints:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Получить все чтения
router.get('/admin/readings', async (req: Request, res: Response) => {
  try {
    const readings = await prisma.reading.findMany({
      include: {
        calendarDays: true
      },
      orderBy: [{ type: 'asc' }, { order: 'asc' }]
    });
    res.json(readings);
  } catch (error) {
    console.error('Error fetching readings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Создать святого (отдельно от календарного дня)
router.post('/saints', async (req: Request, res: Response) => {
  try {
    const { name, description, icon, priority } = req.body;

    const saint = await prisma.saint.create({
      data: {
        name,
        description,
        icon,
        priority: priority || SaintPriority.COMMEMORATED
      }
    });

    res.json(saint);
  } catch (error) {
    console.error('Error creating saint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Обновить святого
router.put('/saints/:saintId', async (req: Request, res: Response) => {
  try {
    const { saintId } = req.params;
    const { name, description, icon, priority } = req.body;

    const saint = await prisma.saint.update({
      where: { id: parseInt(saintId) },
      data: {
        name,
        description,
        icon,
        priority
      }
    });

    res.json(saint);
  } catch (error) {
    console.error('Error updating saint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Создать чтение (отдельно от календарного дня)
router.post('/readings', async (req: Request, res: Response) => {
  try {
    const { type, reference, title, text, order } = req.body;

    const reading = await prisma.reading.create({
      data: {
        type,
        reference,
        title,
        text,
        order: order || 0
      }
    });

    res.json(reading);
  } catch (error) {
    console.error('Error creating reading:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Обновить чтение
router.put('/readings/:readingId', async (req: Request, res: Response) => {
  try {
    const { readingId } = req.params;
    const { type, reference, title, text, order } = req.body;

    const reading = await prisma.reading.update({
      where: { id: parseInt(readingId) },
      data: {
        type,
        reference,
        title,
        text,
        order
      }
    });

    res.json(reading);
  } catch (error) {
    console.error('Error updating reading:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
