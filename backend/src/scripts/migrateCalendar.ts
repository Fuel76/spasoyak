import { PrismaClient, DayPriority, FastingType, SaintPriority, ReadingType } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

interface OldCalendarData {
  date: string;
  saints: string[];
  readings: string[];
  holidays: string[];
}

async function migrateCalendarData() {
  try {
    console.log('Начинаем миграцию календарных данных...');
    
    // Читаем старые данные
    const dataPath = path.join(__dirname, '../../orthodox-calendar.json');
    const oldData: OldCalendarData[] = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    
    console.log(`Найдено ${oldData.length} записей для миграции`);
    
    for (const item of oldData) {
      console.log(`Обрабатываем дату: ${item.date}`);
      
      // Определяем приоритет дня на основе праздников
      let priority = DayPriority.NORMAL;
      let isHoliday = false;
      let color = null;
      
      if (item.holidays && item.holidays.length > 0) {
        isHoliday = true;
        // Логика определения приоритета на основе названий праздников
        const holidayText = item.holidays.join(' ').toLowerCase();
        
        if (holidayText.includes('пасх') || holidayText.includes('рождеств') || holidayText.includes('богоявлен')) {
          priority = DayPriority.GREAT_FEAST;
          color = 'red';
        } else if (holidayText.includes('двунадесят') || holidayText.includes('благовещен') || holidayText.includes('преображен')) {
          priority = DayPriority.TWELVE_FEAST;
          color = 'gold';
        } else if (holidayText.includes('полиелей')) {
          priority = DayPriority.POLYELEOS;
          color = 'blue';
        } else if (holidayText.includes('всенощн') || holidayText.includes('бден')) {
          priority = DayPriority.VIGIL;
          color = 'green';
        } else {
          priority = DayPriority.SIXTH_CLASS;
          color = 'black';
        }
      }
      
      // Создаем календарный день
      const calendarDay = await prisma.calendarDay.upsert({
        where: { date: new Date(item.date) },
        update: {
          priority,
          isHoliday,
          color,
          note: item.holidays.length > 0 ? item.holidays.join('; ') : null
        },
        create: {
          date: new Date(item.date),
          priority,
          isHoliday,
          color,
          note: item.holidays.length > 0 ? item.holidays.join('; ') : null
        }
      });
      
      // Добавляем святых
      for (const saintName of item.saints) {
        // Определяем приоритет святого
        let saintPriority = SaintPriority.COMMEMORATED;
        const saintText = saintName.toLowerCase();
        
        if (saintText.includes('вмч.') || saintText.includes('великомученик')) {
          saintPriority = SaintPriority.GREAT_SAINT;
        } else if (saintText.includes('свт.') || saintText.includes('святитель')) {
          saintPriority = SaintPriority.VIGIL_SAINT;
        } else if (saintText.includes('прп.') || saintText.includes('преподобный')) {
          saintPriority = SaintPriority.SIXTH_CLASS;
        }
        
        await prisma.saint.create({
          data: {
            name: saintName,
            priority: saintPriority,
            calendarDays: {
              connect: { id: calendarDay.id }
            }
          }
        });
      }
      
      // Добавляем чтения
      let order = 0;
      for (const reading of item.readings) {
        // Определяем тип чтения
        let readingType = ReadingType.APOSTLE;
        const readingText = reading.toLowerCase();
        
        if (readingText.includes('ин.') || readingText.includes('мф.') || 
            readingText.includes('мк.') || readingText.includes('лк.')) {
          readingType = ReadingType.GOSPEL;
        } else if (readingText.includes('быт.') || readingText.includes('исх.') || 
                   readingText.includes('лев.') || readingText.includes('чис.')) {
          readingType = ReadingType.OLD_TESTAMENT;
        }
        
        await prisma.reading.create({
          data: {
            type: readingType,
            reference: reading,
            order: order++,
            calendarDays: {
              connect: { id: calendarDay.id }
            }
          }
        });
      }
    }
    
    console.log('Миграция календарных данных завершена успешно!');
    
  } catch (error) {
    console.error('Ошибка при миграции календарных данных:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Запускаем миграцию, если файл выполняется напрямую
if (require.main === module) {
  migrateCalendarData();
}

export { migrateCalendarData };
