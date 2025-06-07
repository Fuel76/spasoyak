import { Router } from 'express';

const router = Router();

// УСТАРЕВШИЙ API: Модель TrebaFormField была удалена в пользу новой архитектуры
// Оставлен для обратной совместимости

router.all('*', (req, res) => {
  res.status(410).json({
    error: 'Данный API устарел и больше не поддерживается',
    message: 'Поля форм теперь управляются через новый API треб v2',
    redirect: '/api/v2/treby',
    deprecated: true
  });
});

export default router;
