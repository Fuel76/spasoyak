import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const newsCount = await prisma.news.count();
  console.log(`Количество новостей: ${newsCount}`);
  await prisma.$disconnect();
}

main()
  .catch(console.error);
