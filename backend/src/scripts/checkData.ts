import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkData() {
  try {
    console.log('Проверяем данные в базе...');
    
    const days = await prisma.calendarDay.findMany();
    console.log(`\nКалендарные дни (${days.length}):`);
    days.forEach(d => console.log(`- ${d.date.toISOString().split('T')[0]} (праздник: ${d.isHoliday})`));
    
    const schedules = await prisma.schedule.findMany();
    console.log(`\nРасписание (${schedules.length}):`);
    schedules.forEach(s => console.log(`- ${s.date.toISOString().split('T')[0]} ${s.time} ${s.title}`));
    
  } catch (error) {
    console.error('Ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();
