import express, { Request, Response, NextFunction } from 'express';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { trpcRouter } from './trpc';
import cors from 'cors';
import pagesRouter from './routes/pages';
import savePageRouter from './routes/savePage';
import newsRouter from './routes/news';
import authRouter from './routes/auth';
import menuRouter from './routes/menu';
import { carouselRouter } from './routes/carousel';
import { requestLogger, corsMiddleware } from './middleware/globalMiddleware';
import { errorHandler } from './middleware/errorHandler';

const app = express();

// Глобальные middleware
app.use(corsMiddleware);
app.use(cors({
  origin: 'http://localhost:5173', // или '*' для всех источников, но лучше явно
  credentials: true, // если нужны cookie/авторизация
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(requestLogger);

// Раздача статических файлов
app.use('/uploads', express.static('uploads'));

// TRPC middleware
app.use(
  '/trpc',
  createExpressMiddleware({
    router: trpcRouter
  })
);

// Маршрутные middleware
app.use('/api', pagesRouter);
app.use('/api/save-page', savePageRouter);
app.use('/api/news', newsRouter);
app.use('/api/auth', authRouter);
app.use('/api/menu', menuRouter);
app.use('/api/carousel', carouselRouter);
app.use('/carousel', carouselRouter);

// Middleware для обработки ошибок (должен быть последним)
app.use(errorHandler);

// Middleware для обработки маршрутов, которые не были найдены
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: 'Маршрут не найден' });
});

// Обработчик ошибок
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(`[${new Date().toISOString()}] Ошибка: ${err.message}`);
  res.status(500).json({ message: 'Внутренняя ошибка сервера', error: err.message });
});

app.listen(3000, () => {
  console.log('Сервер запущен на порту 3000');
});
