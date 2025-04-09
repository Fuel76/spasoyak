import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();

// Получение списка новостей
router.get('/', async (req, res) => {
  const news = await prisma.news.findMany();
  res.json(news);
});

// Добавление новой новости
router.post('/add', async (req, res) => {
  const { title, content } = req.body;

  try {
    const news = await prisma.news.create({
      data: {
        title,
        content,
      },
    });
    res.status(200).send({ message: 'Новость успешно добавлена!', news });
  } catch (error) {
    console.error('Ошибка при добавлении новости:', error);
    res.status(500).send({ error: 'Ошибка при добавлении новости.' });
  }
});

// Редактирование существующей новости
router.put('/edit/:id', async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;

  try {
    const news = await prisma.news.update({
      where: { id: parseInt(id, 10) },
      data: {
        title,
        content,
      },
    });
    res.status(200).send({ message: 'Новость успешно обновлена!', news });
  } catch (error) {
    console.error('Ошибка при редактировании новости:', error);
    res.status(500).send({ error: 'Ошибка при редактировании новости.' });
  }
});

export default router;