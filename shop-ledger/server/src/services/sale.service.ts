import { and, desc, eq, gte, lte } from "drizzle-orm";
import { db } from "../config/db.js";
import { salesTable, type Sale } from "../models/sale.model.js";
import { ApiError } from "../utils/ApiError.js";
import { fmtAmount, toNumber } from "../utils/money.js";
import type { CreateSaleInput, UpdateSaleInput } from "../validations/sale.validation.js";

function serialize(row: Sale) {
  return {
    id: row.id,
    amount: toNumber(row.amount),
    note: row.note,
    date: row.date,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function listSales(params: { from?: string; to?: string }) {
  const conditions = [];
  if (params.from) conditions.push(gte(salesTable.date, params.from));
  if (params.to) conditions.push(lte(salesTable.date, params.to));

  const rows = await db
    .select()
    .from(salesTable)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(salesTable.date), desc(salesTable.id));

  return rows.map(serialize);
}

export async function createSale(input: CreateSaleInput) {
  const [row] = await db
    .insert(salesTable)
    .values({
      amount: fmtAmount(input.amount),
      note: input.note ?? null,
      date: input.date,
    })
    .returning();
  return serialize(row);
}

export async function updateSale(id: number, input: UpdateSaleInput) {
  const updates: Partial<typeof salesTable.$inferInsert> = {};
  if (input.amount !== undefined) updates.amount = fmtAmount(input.amount);
  if (input.note !== undefined) updates.note = input.note;
  if (input.date !== undefined) updates.date = input.date;
  if (Object.keys(updates).length === 0) throw ApiError.badRequest("No fields to update");

  const [row] = await db.update(salesTable).set(updates).where(eq(salesTable.id, id)).returning();
  if (!row) throw ApiError.notFound("Sale not found");
  return serialize(row);
}

export async function deleteSale(id: number) {
  const [row] = await db.delete(salesTable).where(eq(salesTable.id, id)).returning();
  if (!row) throw ApiError.notFound("Sale not found");
}
