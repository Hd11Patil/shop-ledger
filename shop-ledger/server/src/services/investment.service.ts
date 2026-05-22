import { and, desc, eq, gte, lte } from "drizzle-orm";
import { db } from "../config/db.js";
import { investmentsTable, type Investment } from "../models/investment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { fmtAmount, toNumber } from "../utils/money.js";
import type {
  CreateInvestmentInput,
  UpdateInvestmentInput,
} from "../validations/investment.validation.js";

function serialize(row: Investment) {
  return {
    id: row.id,
    amount: toNumber(row.amount),
    note: row.note,
    date: row.date,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function listInvestments(params: { from?: string; to?: string }) {
  const conditions = [];
  if (params.from) conditions.push(gte(investmentsTable.date, params.from));
  if (params.to) conditions.push(lte(investmentsTable.date, params.to));

  const rows = await db
    .select()
    .from(investmentsTable)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(investmentsTable.date), desc(investmentsTable.id));

  return rows.map(serialize);
}

export async function createInvestment(input: CreateInvestmentInput) {
  const [row] = await db
    .insert(investmentsTable)
    .values({
      amount: fmtAmount(input.amount),
      note: input.note ?? null,
      date: input.date,
    })
    .returning();
  return serialize(row);
}

export async function updateInvestment(id: number, input: UpdateInvestmentInput) {
  const updates: Partial<typeof investmentsTable.$inferInsert> = {};
  if (input.amount !== undefined) updates.amount = fmtAmount(input.amount);
  if (input.note !== undefined) updates.note = input.note;
  if (input.date !== undefined) updates.date = input.date;
  if (Object.keys(updates).length === 0) throw ApiError.badRequest("No fields to update");

  const [row] = await db
    .update(investmentsTable)
    .set(updates)
    .where(eq(investmentsTable.id, id))
    .returning();
  if (!row) throw ApiError.notFound("Investment not found");
  return serialize(row);
}

export async function deleteInvestment(id: number) {
  const [row] = await db.delete(investmentsTable).where(eq(investmentsTable.id, id)).returning();
  if (!row) throw ApiError.notFound("Investment not found");
}
