import { eq } from "drizzle-orm";
import { db } from "../config/db.js";
import { settingsTable, type Settings } from "../models/settings.model.js";
import type { UpdateSettingsInput } from "../validations/settings.validation.js";

function serialize(row: Settings) {
  return {
    shopName: row.shopName,
    currency: row.currency,
    currencySymbol: row.currencySymbol,
  };
}

async function getOrCreate(): Promise<Settings> {
  const [existing] = await db.select().from(settingsTable).where(eq(settingsTable.id, 1));
  if (existing) return existing;
  const [created] = await db.insert(settingsTable).values({ id: 1 }).returning();
  return created;
}

export async function getSettings() {
  return serialize(await getOrCreate());
}

export async function updateSettings(input: UpdateSettingsInput) {
  await getOrCreate();
  const [row] = await db.update(settingsTable).set(input).where(eq(settingsTable.id, 1)).returning();
  return serialize(row);
}
