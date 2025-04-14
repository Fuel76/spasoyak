import { Request, Response, NextFunction } from 'express';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    res.status(401).json({ message: 'Токен не предоставлен' });
    return;
  }

  // Здесь вы можете проверить токен (например, с помощью JWT)
  if (token !== 'mock-token') {
    res.status(403).json({ message: 'Доступ запрещён' });
    return;
  }

  next(); // Передаём управление следующему middleware
};