import pg from "pg";
import type { PoolConfig } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { env } from "./env.js";
import * as schema from "../db/schema.js";
import { logger } from "../utils/logger.js";

const { Pool } = pg;

function isLocalDatabaseHost(hostname: string): boolean {
  return ["localhost", "127.0.0.1", "::1", "postgres"].includes(hostname);
}

function resolveDatabaseSsl(url: URL): PoolConfig["ssl"] | undefined {
  if (env.DATABASE_SSL === "false") return undefined;

  const sslMode = url.searchParams.get("sslmode")?.toLowerCase();
  if (sslMode === "disable") return undefined;

  const rejectUnauthorized =
    sslMode === "verify-full" || sslMode === "verify-ca"
      ? true
      : env.DATABASE_SSL_REJECT_UNAUTHORIZED;

  if (
    env.DATABASE_SSL === "true" ||
    sslMode ||
    (env.NODE_ENV === "production" && !isLocalDatabaseHost(url.hostname))
  ) {
    return { rejectUnauthorized };
  }

  return undefined;
}

function connectionStringWithoutPgSslParams(url: URL): string {
  const sanitized = new URL(url.toString());
  for (const param of ["sslmode", "sslcert", "sslkey", "sslrootcert"]) {
    sanitized.searchParams.delete(param);
  }
  return sanitized.toString();
}

const databaseUrl = new URL(env.DATABASE_URL);
const ssl = resolveDatabaseSsl(databaseUrl);

export const pool = new Pool({
  connectionString: connectionStringWithoutPgSslParams(databaseUrl),
  ...(ssl ? { ssl } : {}),
  max: env.DB_POOL_MAX,
  idleTimeoutMillis: env.DB_IDLE_TIMEOUT_MS,
  connectionTimeoutMillis: env.DB_CONNECTION_TIMEOUT_MS,
});

pool.on("error", (err) => {
  logger.error({ err }, "Unexpected Postgres pool error");
});

export const db = drizzle(pool, { schema });

export async function closeDb(): Promise<void> {
  await pool.end();
}
