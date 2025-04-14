import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();

// Получение всех пунктов меню с вложенностью
router.get('/', async (req, res) => {
  try {
    const menuItems = await prisma.menuItem.findMany({
      where: { parentId: null },
      include: {
        children: {
          include: {
            children: true, // Рекурсивное получение вложенных пунктов
          },
        },
      },
    });
    res.json(menuItems);
  } catch (error) {
    console.error('Ошибка при получении пунктов меню:', error);
    res.status(500).json({ error: 'Ошибка при получении пунктов меню' });
  }
});

// Добавление нового пункта меню
router.post('/', async (req, res) => {
  const { title, link, parentId, mute } = req.body;

  try {
    const menuItem = await prisma.menuItem.create({
      data: {
        title,
        link,
        mute: mute || false,
        parentId,
      },
    });
    res.status(201).json(menuItem);
  } catch (error) {
    console.error('Ошибка при добавлении пункта меню:', error);
    res.status(500).json({ error: 'Ошибка при добавлении пункта меню' });
  }
});

// Обновление пункта меню
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { title, link, mute } = req.body;

  try {
    const menuItem = await prisma.menuItem.update({
      where: { id: parseInt(id, 10) },
      data: {
        title,
        link,
        mute,
      },
    });
    res.json(menuItem);
  } catch (error) {
    console.error('Ошибка при обновлении пункта меню:', error);
    res.status(500).json({ error: 'Ошибка при обновлении пункта меню' });
  }
});

// Удаление пункта меню
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.menuItem.delete({
      where: { id: parseInt(id, 10) },
    });
    res.status(204).send();
  } catch (error) {
    console.error('Ошибка при удалении пункта меню:', error);
    res.status(500).json({ error: 'Ошибка при удалении пункта меню' });
  }
});

export default router;