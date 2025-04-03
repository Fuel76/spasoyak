import { initTRPC } from "@trpc/server";

const news = [
  {
    id: 1,
    title: "News 1",
    content: "Content 1",
  },
  {
    id: 2,
    title: "News 2",
    content: "Content 2",
  },
];

const trpc = initTRPC.create();

export const trpcRouter = trpc.router({
  getNews: trpc.procedure.query(() => {
    return { news };
  }),
});
export type TrpcRouter = typeof trpcRouter;
