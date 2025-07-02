import { Router } from 'express';

const router = Router();

// УСТАРЕВШИЙ API: Этот роутер заменен на /api/v2/treby
// Оставлен для обратной совместимости

router.all('*', (req, res) => {
  res.status(410).json({
    error: 'Данный API устарел и больше не поддерживается',
    message: 'Используйте новый API: /api/v2/treby',
    redirect: '/api/v2/treby',
    deprecated: true
  });
});

export default router;