import { Router } from 'express';

const router = Router();

// УСТАРЕВШИЙ API: Модель TrebaPricingRule была удалена в пользу новой архитектуры
// Оставлен для обратной совместимости

router.all('*', (req, res) => {
  res.status(410).json({
    error: 'Данный API устарел и больше не поддерживается',
    message: 'Правила ценообразования теперь рассчитываются автоматически в новом API треб v2',
    redirect: '/api/v2/treby',
    deprecated: true
  });
});

export default router;
