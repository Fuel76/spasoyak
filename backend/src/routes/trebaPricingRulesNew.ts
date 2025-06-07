import { Router } from 'express';

const router = Router();

// ЗАГЛУШКА: Модель TrebaPricingRule была удалена в пользу новой архитектуры
// Этот роутер оставлен для обратной совместимости, но возвращает пустые данные

// Получить все правила ценообразования (заглушка)
router.get('/', async (req, res) => {
  res.json({
    message: 'TrebaPricingRule модель была заменена на новую архитектуру расчета стоимости',
    data: [],
    deprecated: true
  });
});

// Создать правило ценообразования (заглушка)
router.post('/', async (req, res) => {
  res.status(410).json({ 
    error: 'Создание правил ценообразования больше не поддерживается. Используйте новый API треб.',
    deprecated: true
  });
});

// Получить правило по ID (заглушка)
router.get('/:id', async (req, res) => {
  res.status(404).json({ 
    error: 'Правило ценообразования не найдено. Модель была удалена.',
    deprecated: true
  });
});

// Обновить правило (заглушка)
router.put('/:id', async (req, res) => {
  res.status(410).json({ 
    error: 'Обновление правил ценообразования больше не поддерживается.',
    deprecated: true
  });
});

// Удалить правило (заглушка)
router.delete('/:id', async (req, res) => {
  res.status(410).json({ 
    error: 'Удаление правил ценообразования больше не поддерживается.',
    deprecated: true
  });
});

export default router;
