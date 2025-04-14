import express from 'express';
import * as trpcExpress from '@trpc/server/adapters/express';
import { trpcRouter } from './trpc';
import cors from 'cors';
import pagesRouter from './routes/pages';
import savePageRouter from './routes/savePage';
import newsRouter from './routes/news';
import authRouter from './routes/auth';
import menuRouter from './routes/menu';
import { requestLogger, corsMiddleware } from './middleware/globalMiddleware';
import { errorHandler } from './middleware/errorHandler';

const app = express();

// Глобальные middleware
app.use(cors()); // CORS
app.use(express.json({ limit: '50mb' })); // Увеличиваем лимит для JSON
app.use(express.urlencoded({ limit: '50mb', extended: true })); // Увеличиваем лимит для URL-кодированных данных
app.use(requestLogger); // Логирование запросов
app.use(corsMiddleware); // Обработка CORS

// Раздача статических файлов
app.use('/uploads', express.static('uploads'));

// TRPC middleware
app.use(
  '/trpc',
  trpcExpress.createExpressMiddleware({
    router: trpcRouter,
  }),
);

// Маршрутные middleware
app.use('/api', pagesRouter);
app.use('/api/save-page', savePageRouter);
app.use('/api/news', newsRouter);
app.use('/api/auth', authRouter);
app.use('/api/menu', menuRouter);

// Middleware для обработки ошибок (должен быть последним)
app.use(errorHandler);

// Middleware для обработки маршрутов, которые не были найдены
app.use((req, res) => {
  res.status(404).json({ message: 'Маршрут не найден' });
});

app.listen(3000, () => {
  console.log('Сервер запущен на http://localhost:3000');
});
