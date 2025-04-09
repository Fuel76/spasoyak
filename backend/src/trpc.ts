import { initTRPC } from "@trpc/server";
import { PrismaClient } from "@prisma/client";

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
});

export type TrpcRouter = typeof trpcRouter;
