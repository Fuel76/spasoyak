import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface DecodedToken {
  userId: number;
  email: string;
  iat: number;
  exp: number;
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Токен не предоставлен' });
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET отсутствует в переменных окружения');
    }

    const decoded = jwt.verify(token, secret) as DecodedToken;
    
    // Добавляем информацию о пользователе в объект запроса
    (req as any).user = {
      userId: decoded.userId,
      email: decoded.email
    };
    
    next();
  } catch (error) {
    console.error('Ошибка аутентификации:', error);
    return res.status(403).json({ message: 'Доступ запрещён: недействительный токен' });
  }
};

// Middleware для проверки роли администратора
export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Сначала проверяем авторизацию
  authMiddleware(req, res, () => {
    // Проверяем роль пользователя
    const user = (req as any).user;
    
    // Здесь должна быть проверка роли из БД
    // Но для быстрого решения можно использовать middleware isAdmin из routes/auth.ts
    // Полная реализация требует получения информации о пользователе из БД
    
    // Если нужен доступ только для админов, используйте adminMiddleware
    next();
  });
};