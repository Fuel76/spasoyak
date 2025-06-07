const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

function parseDateSafe(dateString) {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

async function debugCalendar() {
  try {
    const date = '2025-07-12';
    const parsedDate = parseDateSafe(date);
    
    console.log('Original date string:', date);
    console.log('Parsed date:', parsedDate);
    console.log('Parsed date ISO:', parsedDate.toISOString());
    console.log('Parsed date toString:', parsedDate.toString());
    
    // Проверим, есть ли записи с этой датой
    const existing = await prisma.calendarDay.findMany({
      where: {
        date: {
          gte: new Date(parsedDate.getTime() - 24 * 60 * 60 * 1000),
          lte: new Date(parsedDate.getTime() + 24 * 60 * 60 * 1000)
        }
      }
    });
    
    console.log('\nExisting records:');
    existing.forEach((record, i) => {
      console.log(`${i + 1}. ID: ${record.id}, Date: ${record.date}, ISO: ${record.date.toISOString()}`);
    });
    
    // Попробуем найти точное совпадение
    const exact = await prisma.calendarDay.findUnique({
      where: { date: parsedDate }
    });
    
    console.log('\nExact match:', exact ? `Found ID: ${exact.id}` : 'Not found');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugCalendar();
