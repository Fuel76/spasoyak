import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(`[${new Date().toISOString()}] Ошибка: ${err.message}`);
  res.status(500).json({ message: 'Внутренняя ошибка сервера', error: err.message });
};