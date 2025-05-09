import { Request, Response, NextFunction } from 'express';
import jwt, { JsonWebTokenError, TokenExpiredError, NotBeforeError, VerifyErrors } from 'jsonwebtoken';
import { db } from '../utils/db'; // Централизованное подключение к Prisma

// Интерфейс для JWT payload
interface JwtPayload {
  userId: number;
  email?: string;
  role?: string;
  [key: string]: any;
}

// Расширяем интерфейс Request для типизации пользователя
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        role: string;
        isAdmin: boolean;
      };
    }
  }
}

/**
 * Проверка JWT токена и установка данных пользователя
 */
export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Получение токена из заголовка Authorization
    const authHeader = req.headers['authorization'];
    
    // Если токен в cookie, можно получить его оттуда
    const cookieToken = req.cookies?.token;
    
    // Берем токен из заголовка или из cookie
    const token = authHeader?.split(' ')[1] || cookieToken;

    if (!token) {
      return res.status(401).json({ 
        success: false,
        error: 'Необходима авторизация'
      });
    }

    // JWT секрет из переменных окружения или резервный
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('JWT_SECRET не настроен в переменных окружения');
      return res.status(500).json({ 
        success: false,
        error: 'Ошибка конфигурации сервера' 
      });
    }

    jwt.verify(token, secret, function(err: VerifyErrors | null, decoded: any) {
      if (err) {
        // Расширенная обработка ошибок JWT
        if (err instanceof TokenExpiredError) {
          return res.status(401).json({
            success: false, 
            error: 'Срок действия токена истёк, требуется повторная авторизация',
            code: 'TOKEN_EXPIRED'
          });
        }
        
        return res.status(403).json({
          success: false,
          error: 'Недействительный токен авторизации',
          code: 'INVALID_TOKEN'
        });
      }

      if (!decoded) {
        return res.status(401).json({
          success: false,
          error: 'Недействительный токен авторизации',
        });
      }

      const payload = decoded as JwtPayload;
      if (!payload.userId) {
        return res.status(403).json({
          success: false,
          error: 'Недопустимый формат токена'
        });
      }

      // Используем IIFE для асинхронных операций
      (async () => {
        try {
          // Проверяем существование пользователя в базе данных
          const user = await db.user.findUnique({
            where: { id: payload.userId }
          });

          if (!user) {
            return res.status(403).json({
              success: false,
              error: 'Пользователь не существует или был удален',
              code: 'USER_NOT_FOUND'
            });
          }

          // Устанавливаем данные пользователя в объект запроса
          req.user = {
            id: user.id,
            email: user.email,
            role: user.role,
            isAdmin: user.role === 'admin'
          };

          next();
        } catch (error) {
          console.error('Ошибка при поиске пользователя:', error);
          return res.status(500).json({
            success: false,
            error: 'Внутренняя ошибка сервера при проверке пользователя'
          });
        }
      })();
    });
  } catch (error) {
    console.error('Ошибка авторизации:', error);
    return res.status(500).json({
      success: false,
      error: 'Внутренняя ошибка сервера при проверке авторизации'
    });
  }
};

/**
 * Проверка прав администратора
 */
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Авторизация не выполнена'
    });
  }
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Недостаточно прав для выполнения операции',
      code: 'ADMIN_REQUIRED'
    });
  }
  
  next();
};

/**
 * Опциональная проверка токена - не блокирует запрос при отсутствии токена
 */
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1] || req.cookies?.token;

    if (!token) {
      // Если токен отсутствует, просто продолжаем обработку запроса
      return next();
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('JWT_SECRET не настроен в переменных окружения');
      return next();
    }

    jwt.verify(token, secret, function(err: VerifyErrors | null, decoded: any) {
      if (err) {
        // При ошибке токена просто пропускаем аутентификацию
        return next();
      }

      // Используем здесь явное приведение типов
      const payload = decoded as JwtPayload;

      // Остальная логика без изменений
      if (payload.userId) {
        (async () => {
          try {
            // Асинхронная логика
            const user = await db.user.findUnique({
              where: { id: payload.userId }
            });
            
            if (user) {
              req.user = {
                id: user.id,
                email: user.email,
                role: user.role,
                isAdmin: user.role === 'admin'
              };
            }
            next();
          } catch (error) {
            console.error('Ошибка при проверке пользователя:', error);
            next();
          }
        })();
      } else {
        next();
      }
    });
  } catch (error) {
    // При любой ошибке просто продолжаем без пользовательских данных
    next();
  }
};