import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedNewsData() {
  try {
    console.log('🌱 Начинаем заполнение тестовыми данными...');

    // Проверяем существующие категории
    let categories = await prisma.category.findMany();
    
    if (categories.length === 0) {
      // Создаем категории только если их нет
      categories = await Promise.all([
        prisma.category.create({
          data: {
            name: 'Богослужения',
            slug: 'bogosluzheniya',
            description: 'Расписание и информация о богослужениях',
            color: '#10b981',
            isVisible: true
          }
        }),
        prisma.category.create({
          data: {
            name: 'События',
            slug: 'sobytiya',
            description: 'Важные события в жизни монастыря',
            color: '#3b82f6',
            isVisible: true
          }
        }),
        prisma.category.create({
          data: {
            name: 'Объявления',
            slug: 'obyavleniya',
            description: 'Важные объявления для прихожан',
            color: '#f59e0b',
            isVisible: true
          }
        })
      ]);
      console.log('✅ Категории созданы:', categories.length);
    } else {
      console.log('✅ Категории уже существуют:', categories.length);
    }

    // Проверяем существующие теги
    let tags = await prisma.tag.findMany();
    
    if (tags.length === 0) {
      // Создаем теги только если их нет
      tags = await Promise.all([
        prisma.tag.create({
          data: {
            name: 'Литургия',
            slug: 'liturgiya',
            color: '#10b981',
            isVisible: true
          }
        }),
        prisma.tag.create({
          data: {
            name: 'Молебен',
            slug: 'moleben',
            color: '#3b82f6',
            isVisible: true
          }
        }),
        prisma.tag.create({
          data: {
            name: 'Праздник',
            slug: 'prazdnik',
            color: '#f59e0b',
            isVisible: true
          }
        }),
        prisma.tag.create({
          data: {
            name: 'Паломничество',
            slug: 'palomnichestvo',
            color: '#8b5cf6',
            isVisible: true
          }
        })
      ]);
      console.log('✅ Теги созданы:', tags.length);
    } else {
      console.log('✅ Теги уже существуют:', tags.length);
    }

    // Проверяем существующие новости
    const existingNews = await prisma.news.findMany();
    
    if (existingNews.length === 0) {
      // Создаем тестовые новости только если их нет
      const news = await Promise.all([
        prisma.news.create({
          data: {
            title: 'Рождественское богослужение',
            slug: 'rozhdestvenskoe-bogosluzhenie',
            excerpt: 'Приглашаем всех верующих на торжественное рождественское богослужение',
            content: 'Дорогие братья и сестры! Приглашаем всех на торжественное рождественское богослужение, которое состоится 7 января в 6:00 утра. Будет совершена праздничная Божественная литургия.',
            htmlContent: '<p>Дорогие братья и сестры!</p><p>Приглашаем всех на торжественное рождественское богослужение, которое состоится <strong>7 января в 6:00 утра</strong>.</p><p>Будет совершена праздничная Божественная литургия.</p>',
            media: {},
            categoryId: categories.find(c => c.slug === 'bogosluzheniya')?.id || categories[0].id,
            publishedAt: new Date(),
            isVisible: true,
            isPinned: true,
            viewCount: 0,
            metaTitle: 'Рождественское богослужение - Монастырь',
            metaDescription: 'Приглашаем на рождественское богослужение 7 января в 6:00'
          }
        }),
        prisma.news.create({
          data: {
            title: 'День открытых дверей',
            slug: 'den-otkrytykh-dverey',
            excerpt: 'Приглашаем всех желающих познакомиться с жизнью монастыря',
            content: 'В воскресенье состоится день открытых дверей нашего монастыря. Все желающие смогут познакомиться с историей обители, посетить храм и задать вопросы.',
            htmlContent: '<p>В воскресенье состоится <strong>день открытых дверей</strong> нашего монастыря.</p><p>Все желающие смогут:</p><ul><li>Познакомиться с историей обители</li><li>Посетить храм</li><li>Задать вопросы</li></ul>',
            media: {},
            categoryId: categories.find(c => c.slug === 'sobytiya')?.id || categories[1].id,
            publishedAt: new Date(),
            isVisible: true,
            isPinned: false,
            viewCount: 5,
            metaTitle: 'День открытых дверей - Монастырь',
            metaDescription: 'Приглашаем познакомиться с жизнью монастыря'
          }
        }),
        prisma.news.create({
          data: {
            title: 'Изменение расписания богослужений',
            slug: 'izmenenie-raspisaniya-bogosluzheniy',
            excerpt: 'Уважаемые прихожане, с 1 декабря изменяется расписание богослужений',
            content: 'Уважаемые прихожане! Доводим до вашего сведения, что с 1 декабря изменяется расписание богослужений в связи с зимним временем.',
            htmlContent: '<p><strong>Уважаемые прихожане!</strong></p><p>Доводим до вашего сведения, что с <em>1 декабря</em> изменяется расписание богослужений в связи с зимним временем.</p>',
            media: {},
            categoryId: categories.find(c => c.slug === 'obyavleniya')?.id || categories[2].id,
            publishedAt: new Date(),
            isVisible: true,
            isPinned: false,
            viewCount: 12,
            metaTitle: 'Изменение расписания - Монастырь',
            metaDescription: 'Новое расписание богослужений с 1 декабря'
          }
        })
      ]);

      console.log('✅ Новости созданы:', news.length);

      // Связываем новости с тегами
      await Promise.all([
        // Первая новость - литургия и праздник
        prisma.newsTag.create({
          data: { newsId: news[0].id, tagId: tags.find(t => t.slug === 'liturgiya')?.id || tags[0].id }
        }),
        prisma.newsTag.create({
          data: { newsId: news[0].id, tagId: tags.find(t => t.slug === 'prazdnik')?.id || tags[2].id }
        }),
        // Вторая новость - паломничество
        prisma.newsTag.create({
          data: { newsId: news[1].id, tagId: tags.find(t => t.slug === 'palomnichestvo')?.id || tags[3].id }
        }),
        // Третья новость - литургия
        prisma.newsTag.create({
          data: { newsId: news[2].id, tagId: tags.find(t => t.slug === 'liturgiya')?.id || tags[0].id }
        })
      ]);

      console.log('✅ Связи новостей с тегами созданы');
    } else {
      console.log('✅ Новости уже существуют:', existingNews.length);
    }

    console.log('🎉 Заполнение тестовыми данными завершено!');
    const totalNews = await prisma.news.count();
    console.log(`📊 Итого: ${categories.length} категорий, ${tags.length} тегов, ${totalNews} новостей`);

  } catch (error) {
    console.error('❌ Ошибка при заполнении данными:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedNewsData();
