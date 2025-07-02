const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDates() {
  try {
    console.log('=== Проверка дат в календаре ===');
    
    const days = await prisma.calendarDay.findMany({
      where: {
        date: {
          gte: new Date('2025-06-01'),
          lte: new Date('2025-06-15')
        }
      },
      orderBy: { date: 'asc' }
    });
    
    console.log('Найдено записей:', days.length);
    
    days.forEach((day, index) => {
      console.log(`${index + 1}. ID: ${day.id}, Date: ${day.date.toISOString()}, Local: ${day.date.toLocaleDateString()}`);
    });
    
    // Попробуем найти конкретную дату
    console.log('\n=== Поиск даты 2025-06-12 ===');
    
    // Старый способ (проблемный)
    const oldWay = new Date('2025-06-12');
    console.log('Старый способ парсинга:', oldWay.toISOString());
    
    const foundOld = await prisma.calendarDay.findUnique({
      where: { date: oldWay }
    });
    console.log('Найдено старым способом:', foundOld ? 'ДА' : 'НЕТ');
    
    // Новый способ (исправленный)
    const [year, month, day] = '2025-06-12'.split('-').map(Number);
    const newWay = new Date(year, month - 1, day);
    console.log('Новый способ парсинга:', newWay.toISOString());
    
    const foundNew = await prisma.calendarDay.findUnique({
      where: { date: newWay }
    });
    console.log('Найдено новым способом:', foundNew ? 'ДА' : 'НЕТ');
    
  } catch (error) {
    console.error('Ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDates();
