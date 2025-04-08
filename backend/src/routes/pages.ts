import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();

router.get('/pages', async (req, res) => {
  try {
    const pages = await prisma.page.findMany();
    res.status(200).json(pages); // Возвращаем JSON
  } catch (error) {
    console.error('Ошибка при получении страниц:', error);
    res.status(500).send({ error: 'Ошибка при получении страниц.' });
  }
});

export default router;