import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// ЗАГЛУШКА: Модель TrebaFormField была удалена в пользу новой архитектуры
// Этот роутер оставлен для обратной совместимости

// Получить все поля формы (заглушка)
router.get('/', async (req, res) => {
  res.json({
    message: 'TrebaFormField модель была заменена на новую архитектуру форм',
    data: [],
    deprecated: true
  });
});

// Создать поле формы (заглушка)
router.post('/', async (req, res) => {
  res.status(410).json({ 
    error: 'Создание полей формы больше не поддерживается. Используйте новый API треб.',
    deprecated: true
  });
});

// Получить поле по ID (заглушка)
router.get('/:id', async (req, res) => {
  res.status(404).json({ 
    error: 'Поле формы не найдено. Модель была удалена.',
    deprecated: true
  });
});

// Обновить поле (заглушка)
router.put('/:id', async (req, res) => {
  res.status(410).json({ 
    error: 'Обновление полей формы больше не поддерживается.',
    deprecated: true
  });
});

// Удалить поле (заглушка)
router.delete('/:id', async (req, res) => {
  res.status(410).json({ 
    error: 'Удаление полей формы больше не поддерживается.',
    deprecated: true
  });
});

export default router;
