import { PrismaClient, ServiceType, ServicePriority } from '@prisma/client';

const prisma = new PrismaClient();

async function addTestSchedule() {
  try {
    console.log('Добавляем тестовое расписание...');
    
    // Получаем календарные дни
    const calendarDays = await prisma.calendarDay.findMany();
    console.log(`Найдено ${calendarDays.length} календарных дней`);
    
    for (const calendarDay of calendarDays) {
      console.log(`Обрабатываем день: ${calendarDay.date}`);
      
      // Добавляем утреннюю службу
      await prisma.schedule.create({
        data: {
          time: '08:00',
          title: 'Утренняя служба',
          description: 'Утренняя молитва',
          type: ServiceType.MATINS,
          priority: calendarDay.isHoliday ? ServicePriority.HOLIDAY : ServicePriority.NORMAL,
          date: calendarDay.date,
          calendarDayId: calendarDay.id
        }
      });

      // Добавляем Литургию
      await prisma.schedule.create({
        data: {
          time: '09:00',
          title: 'Божественная Литургия',
          description: 'Главное богослужение дня',
          type: ServiceType.LITURGY,
          priority: calendarDay.isHoliday ? ServicePriority.HOLIDAY : ServicePriority.NORMAL,
          date: calendarDay.date,
          calendarDayId: calendarDay.id
        }
      });

      // Добавляем вечернюю службу
      await prisma.schedule.create({
        data: {
          time: '17:00',
          title: 'Вечерня',
          description: 'Вечернее богослужение',
          type: ServiceType.VESPERS,
          priority: ServicePriority.NORMAL,
          date: calendarDay.date,
          calendarDayId: calendarDay.id
        }
      });

      // Если праздничный день, добавим особую службу
      if (calendarDay.isHoliday) {
        await prisma.schedule.create({
          data: {
            time: '12:00',
            title: 'Праздничный молебен',
            description: 'Особая служба в честь праздника',
            type: ServiceType.MOLEBEN,
            priority: ServicePriority.SPECIAL,
            date: calendarDay.date,
            calendarDayId: calendarDay.id
          }
        });
      }
      
      console.log(`Добавлено расписание для ${calendarDay.date}`);
    }
    
    console.log('Тестовое расписание добавлено успешно!');
    
  } catch (error) {
    console.error('Ошибка при добавлении расписания:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Запускаем, если файл выполняется напрямую
if (require.main === module) {
  addTestSchedule();
}
