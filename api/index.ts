import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../server/routers";
import { createContext } from "../server/_core/context";
import express from "express";

const app = express();

// Configure body parser
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// tRPC API
app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Export for Vercel Serverless
export default (req: VercelRequest, res: VercelResponse) => {
  return app(req as any, res as any);
};
