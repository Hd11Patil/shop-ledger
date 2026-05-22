import "dotenv/config";
import { db, pool } from "../config/db.js";
import { categoriesTable, settingsTable } from "../models/index.js";
import { logger } from "../utils/logger.js";

const DEFAULT_CATEGORIES: Array<{ name: string; color: string }> = [
  { name: "Raw Materials", color: "#E07A5F" },
  { name: "Vegetables", color: "#81B29A" },
  { name: "Spices", color: "#F2CC8F" },
  { name: "Oil & Ghee", color: "#F4A261" },
  { name: "Packaging", color: "#A8DADC" },
  { name: "Rent", color: "#264653" },
  { name: "Utilities", color: "#457B9D" },
  { name: "Wages", color: "#2A9D8F" },
  { name: "Equipment", color: "#9B5DE5" },
  { name: "Other", color: "#6C757D" },
];

async function main() {
  logger.info("Seeding default categories…");
  for (const c of DEFAULT_CATEGORIES) {
    await db.insert(categoriesTable).values(c).onConflictDoNothing({ target: categoriesTable.name });
  }

  logger.info("Ensuring settings row exists…");
  await db.insert(settingsTable).values({ id: 1 }).onConflictDoNothing({ target: settingsTable.id });

  logger.info("Seed complete.");
  await pool.end();
}

main().catch((err) => {
  logger.error({ err }, "Seed failed");
  process.exit(1);
});
