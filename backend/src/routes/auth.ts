import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();
const prisma = new PrismaClient();

router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: 'Email и пароль обязательны' });
    return;
  }

  if (email === 'admin@example.com' && password === 'admin123') {
    const token = 'mock-token'; // Здесь должен быть реальный JWT
    const user = {
      id: '1',
      email: 'admin@example.com',
      role: 'super_admin',
      permissions: ['*'],
    };

    res.json({ user, token });
  } else {
    res.status(401).json({ message: 'Неверный email или пароль' });
  }
});

router.post('/logout', (req, res) => {
  res.json({ message: 'Выход выполнен успешно' });
});

router.get('/profile', authMiddleware, (req, res) => {
  const user = {
    id: '1',
    email: 'admin@example.com',
    role: 'super_admin',
    permissions: ['*'],
  };
  res.json(user);
});

router.get('/user', authMiddleware, async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      res.status(401).json({ message: 'Токен не предоставлен' });
      return;
    }

    const userId = 1; // Пример: замените на реальный ID из токена

    const user = {
      id: userId,
      email: 'user@example.com',
      role: 'user',
    };

    res.json(user);
  } catch (error) {
    next(error);
  }
});

export default router;