import express from "express";
import * as trpcExpress from "@trpc/server/adapters/express";
import { trpcRouter } from "./trpc";
import cors from "cors";
import pagesRouter from './routes/pages';
import savePageRouter from './routes/savePage';
import newsRouter from './routes/news';
import authRouter from './routes/auth';

const app = express();
app.use(cors());
app.use(express.json());
app.use(
  "/trpc",
  trpcExpress.createExpressMiddleware({
    router: trpcRouter,
  }),
);
app.use('/api', pagesRouter);
app.use('/api/save-page', savePageRouter);
app.use('/api/news', newsRouter);
app.use('/api/auth', authRouter);

app.listen(3000, () => {
  console.log('Сервер запущен на http://localhost:3000');
});
