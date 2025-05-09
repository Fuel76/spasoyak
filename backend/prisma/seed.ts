import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  // Администратор создаётся только через API регистрации!

  // Генерация новостей с рандомным количеством абзацев и случайными медиа
  for (let i = 0; i < 20; i++) {
    await prisma.news.create({
      data: {
        title: faker.lorem.sentence(),
        content: faker.lorem.paragraphs(faker.number.int({ min: 1, max: 4 })),
        media: Array.from({ length: faker.number.int({ min: 0, max: 3 }) }, () => faker.image.url()),
      },
    });
  }

  // Генерация тестовых страниц
  for (let i = 0; i < 5; i++) {
    await prisma.page.create({
      data: {
        slug: faker.helpers.slugify(faker.lorem.words(2)).toLowerCase() + '-' + i,
        title: faker.lorem.sentence(),
        content: faker.lorem.paragraphs(3),
        isVisible: true,
        customCss: '',
        metaDescription: faker.lorem.sentence(),
        metaKeywords: faker.lorem.words(5),
      },
    });
  }

  console.log('Сидирование завершено успешно!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });