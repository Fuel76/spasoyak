import { PrismaClient, ServiceType, ServicePriority } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

interface OldScheduleItem {
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  description: string;
  type?: string;
  priority?: string;
}

// Маппинг старых типов к новым
const typeMapping: Record<string, ServiceType> = {
  'regular': ServiceType.REGULAR,
  'liturgy': ServiceType.LITURGY,
  'vespers': ServiceType.VESPERS,
  'matins': ServiceType.MATINS,
  'moleben': ServiceType.MOLEBEN,
  'panikhida': ServiceType.PANIKHIDA,
  'akathist': ServiceType.AKATHIST,
  'special': ServiceType.SPECIAL
};

const priorityMapping: Record<string, ServicePriority> = {
  'normal': ServicePriority.NORMAL,
  'special': ServicePriority.SPECIAL,
  'holiday': ServicePriority.HOLIDAY
};

async function migrateScheduleData() {
  try {
    console.log('Начинаем миграцию данных расписания...');
    
    // Читаем старые данные
    const dataPath = path.join(__dirname, '../../schedule.json');
    const oldData: OldScheduleItem[] = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    
    console.log(`Найдено ${oldData.length} записей расписания для миграции`);
    
    // Удаляем старые данные расписания
    await prisma.schedule.deleteMany({});
    console.log('Старые данные расписания удалены');
    
    for (const item of oldData) {
      console.log(`Обрабатываем запись: ${item.date} ${item.time} - ${item.description}`);
      
      const date = new Date(item.date);
      
      // Ищем или создаем календарный день
      let calendarDay = await prisma.calendarDay.findUnique({
        where: { date }
      });
      
      if (!calendarDay) {
        console.log(`Создаем календарный день для ${item.date}`);
        calendarDay = await prisma.calendarDay.create({
          data: {
            date,
            priority: 'NORMAL',
            fastingType: 'NONE',
            isHoliday: false
          }
        });
      }
      
      // Создаем запись расписания
      await prisma.schedule.create({
        data: {
          date,
          time: item.time,
          title: item.description,
          description: item.description,
          type: typeMapping[item.type || 'regular'] || ServiceType.REGULAR,
          priority: priorityMapping[item.priority || 'normal'] || ServicePriority.NORMAL,
          calendarDayId: calendarDay.id,
          isVisible: true
        }
      });
      
      console.log(`Добавлена запись расписания: ${item.date} ${item.time}`);
    }
    
    console.log('Миграция данных расписания завершена успешно!');
    
  } catch (error) {
    console.error('Ошибка при миграции данных расписания:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Запускаем миграцию, если файл выполняется напрямую
if (require.main === module) {
  migrateScheduleData();
}

export { migrateScheduleData };
