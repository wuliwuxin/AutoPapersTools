import { systemRouter } from "./_core/systemRouter";
import { router } from "./_core/trpc";
import { papersRouter } from "./routers/papers";
import { authRouter } from "./routers/auth";
import { apiKeysRouter } from "./routers/apiKeys";

export const appRouter = router({
  system: systemRouter,
  auth: authRouter,
  papers: papersRouter,
  apiKeys: apiKeysRouter,
});

export type AppRouter = typeof appRouter;

// if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
