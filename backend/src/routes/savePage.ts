import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();

router.post('/', async (req, res) => {
  const { title, slug, content } = req.body;

  try {
    const page = await prisma.page.create({
      data: {
        title,
        slug,
        content,
      },
    });
    res.status(200).send({ message: 'Страница успешно создана!', page });
  } catch (error) {
    console.error('Ошибка при создании страницы:', error);
    res.status(500).send({ error: 'Ошибка при создании страницы.' });
  }
});

export default router;