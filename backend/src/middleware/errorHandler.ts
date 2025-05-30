import { Request, Response, NextFunction } from 'express';

// Класс для API ошибок с кодом статуса
export class ApiError extends Error {
  statusCode: number;
  
  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'ApiError';
  }
}

// Вспомогательные методы для создания стандартных ошибок
export const BadRequestError = (message = 'Некорректный запрос') => new ApiError(400, message);
export const UnauthorizedError = (message = 'Требуется авторизация') => new ApiError(401, message);
export const ForbiddenError = (message = 'Доступ запрещен') => new ApiError(403, message);
export const NotFoundError = (message = 'Ресурс не найден') => new ApiError(404, message);
export const ConflictError = (message = 'Конфликт данных') => new ApiError(409, message);

// Глобальный обработчик ошибок
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(`[${new Date().toISOString()}] Ошибка: ${err.message}`);
  console.error(err.stack);
  
  // Если это наша API ошибка, возвращаем соответствующий статус
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message
    });
  }

  // Обработка ошибок Prisma
  if (err.name === 'PrismaClientKnownRequestError') {
    return res.status(400).json({
      success: false,
      error: 'Ошибка базы данных',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }

  // Для всех остальных ошибок - 500 Internal Server Error
  res.status(500).json({
    success: false,
    error: 'Внутренняя ошибка сервера',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
};