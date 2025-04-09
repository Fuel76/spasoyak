import { Router } from 'express';

const router = Router();

router.post('/login', (req, res) => {
  const { email, password } = req.body;

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

router.get('/profile', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (token === 'mock-token') {
    const user = {
      id: '1',
      email: 'admin@example.com',
      role: 'super_admin',
      permissions: ['*'],
    };
    res.json(user);
  } else {
    res.status(401).json({ message: 'Не авторизован' });
  }
});

export default router;