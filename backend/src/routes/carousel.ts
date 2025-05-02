import express from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const carouselRouter = express.Router();

// Получение всех изображений карусели
carouselRouter.get('/', async (req, res) => {
  try {
    const images = await prisma.carouselImage.findMany();
    res.json(images);
  } catch (error) {
    console.error('Ошибка при получении изображений карусели:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Добавление нового изображения
carouselRouter.post('/', async (req, res) => {
  try {
    const { url } = req.body;

    if (!url || typeof url !== 'string') {
      return res.status(400).json({ message: 'URL изображения обязателен и должен быть строкой' });
    }

    const newImage = await prisma.carouselImage.create({ data: { url } });
    res.status(201).json(newImage);
  } catch (error) {
    console.error('Ошибка при добавлении изображения в карусель:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Удаление изображения
carouselRouter.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID изображения должен быть числом' });
    }

    await prisma.carouselImage.delete({ where: { id } });
    res.json({ message: 'Изображение удалено' });
  } catch (error) {
    console.error('Ошибка при удалении изображения из карусели:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export { carouselRouter };