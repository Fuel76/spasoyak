import { initTRPC } from "@trpc/server";
import { PrismaClient } from "@prisma/client";
import { z } from 'zod';

const prisma = new PrismaClient();

export { prisma };

const trpc = initTRPC.create();

export const trpcRouter = trpc.router({
  getNews: trpc.procedure.query(async () => {
    const news = await prisma.news.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return { news };
  }),
  getNewsById: trpc.procedure
    .input(z.number()) // Используем zod для валидации
    .query(async ({ input }) => {
      const news = await prisma.news.findUnique({
        where: { id: input },
      });
      if (!news) throw new Error('Новость не найдена');
      return news;
    }),
});

export type TrpcRouter = typeof trpcRouter;
