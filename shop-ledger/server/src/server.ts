import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./utils/logger.js";
import { closeDb, pool } from "./config/db.js";

async function main() {
  // Verify DB connectivity early so we fail fast on bad config.
  try {
    await pool.query("SELECT 1");
    logger.info("Database connection OK");
  } catch (err) {
    logger.fatal({ err }, "Failed to connect to the database");
    process.exit(1);
  }

  const app = createApp();
  const server = app.listen(env.PORT, "0.0.0.0", () => {
    logger.info(`Shop Ledger API listening on http://0.0.0.0:${env.PORT}`);
  });

  let isShuttingDown = false;
  const shutdown = async (signal: string, exitCode = 0) => {
    if (isShuttingDown) return;
    isShuttingDown = true;

    logger.info({ signal }, "Shutting down");
    const forceExit = setTimeout(() => {
      logger.error({ signal }, "Forced shutdown after timeout");
      process.exit(1);
    }, 10_000);
    forceExit.unref();

    try {
      if (server.listening) {
        await new Promise<void>((resolve, reject) => {
          server.close((err) => {
            if (err) reject(err);
            else resolve();
          });
        });
      }
      await closeDb();
      process.exit(exitCode);
    } catch (err) {
      logger.error({ err }, "Graceful shutdown failed");
      process.exit(1);
    } finally {
      clearTimeout(forceExit);
    }
  };

  server.on("error", (err) => {
    logger.fatal({ err }, "HTTP server error");
    void shutdown("serverError", 1);
  });

  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
  process.on("unhandledRejection", (reason) => {
    logger.error({ reason }, "Unhandled rejection");
  });
  process.on("uncaughtException", (err) => {
    logger.fatal({ err }, "Uncaught exception");
    void shutdown("uncaughtException", 1);
  });
}

void main();
