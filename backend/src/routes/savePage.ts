import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();

router.post('/', async (req, res) => {
  const { title, slug, content } = req.body;

  try {
    const existingPage = await prisma.page.findUnique({
      where: { slug },
    });

    if (existingPage) {
      res.status(400).json({ error: 'Slug уже используется' });
      return;
    }

    const page = await prisma.page.create({
      data: {
        title,
        slug,
        content,
      },
    });
    res.status(201).json(page);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при создании страницы' });
  }
});

export default router;