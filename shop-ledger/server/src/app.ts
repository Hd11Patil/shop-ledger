import express, { type Express } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import { pinoHttp } from "pino-http";
import rateLimit from "express-rate-limit";
import { logger } from "./utils/logger.js";
import { corsOrigins, isProduction } from "./config/env.js";
import routes from "./routes/index.js";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware.js";

export function createApp(): Express {
  const app = express();
  const allowAnyCorsOrigin = corsOrigins.includes("*");

  app.disable("x-powered-by");
  app.set("trust proxy", 1);

  app.use(helmet());
  app.use(
    cors({
      origin: allowAnyCorsOrigin ? true : corsOrigins,
      credentials: !allowAnyCorsOrigin,
    }),
  );
  app.use(compression());
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(pinoHttp({ logger }));

  // Global API rate limit (auth has its own stricter limit on top of this).
  app.use(
    "/api",
    rateLimit({
      windowMs: 60 * 1000,
      max: isProduction ? 300 : 1000,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );
  app.get("/", (_req, res) => {
    res.status(200).json({
      status: "OK",
      environment: process.env.NODE_ENV,
    });
  });

  app.use("/api", routes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
