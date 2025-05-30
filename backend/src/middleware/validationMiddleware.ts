import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

/**
 * Middleware для валидации запросов с помощью схем Zod
 * @param schema Zod-схема для валидации
 * @param source Источник данных в запросе ('body' | 'query' | 'params')
 */
export const validate = (schema: AnyZodObject, source: 'body' | 'query' | 'params' = 'body') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Валидируем данные из указанного источника
      const data = await schema.parseAsync(req[source]);
      
      // Заменяем исходные данные на валидированные
      req[source] = data;
      
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Возвращаем структурированные ошибки валидации
        return res.status(400).json({
          success: false,
          error: 'Ошибка валидации',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }
      
      // Если произошла другая ошибка, передаем ее дальше
      return next(error);
    }
  };
};
