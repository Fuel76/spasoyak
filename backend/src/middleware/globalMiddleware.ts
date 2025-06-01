import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

/**
 * Middleware для расширенного логирования запросов
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const { method, url, ip, headers } = req;
  
  // Логируем начало запроса
  logger.info(`Запрос: ${method} ${url} от ${ip}`);
  
  // Добавляем слушателей для логирования ответа
  res.on('finish', () => {
    const duration = Date.now() - start;
    const { statusCode } = res;
    
    // Форматируем сообщение о завершении запроса
    const message = `Ответ: ${statusCode} ${method} ${url} - ${duration}ms`;
    
    if (statusCode >= 500) {
      logger.error(message);
    } else if (statusCode >= 400) {
      logger.warn(message);
    } else {
      logger.info(message);
    }
  });
  
  next();
};

/**
 * Middleware для обработки CORS
 */
export const corsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Получаем список разрешенных источников из переменных окружения
  const prodOrigin = process.env.FRONTEND_URL || '';
  const allowedOrigins = process.env.NODE_ENV === 'production'
    ? [prodOrigin]
    : ['http://localhost:5173', 'http://localhost:3000'];

  const requestOrigin = req.headers.origin || '';

  // В production разрешаем запросы с текущего домена (nginx-прокси), а также пустой origin (например, curl, SSR, прямой fetch)
  if (
    (process.env.NODE_ENV === 'production' && (requestOrigin === prodOrigin || !requestOrigin)) ||
    allowedOrigins.includes(requestOrigin)
  ) {
    res.setHeader('Access-Control-Allow-Origin', requestOrigin || prodOrigin);
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Для предварительных запросов OPTIONS возвращаем 200 OK
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  next();
};