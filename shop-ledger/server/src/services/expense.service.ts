import { and, desc, eq, gte, lte } from "drizzle-orm";
import { db } from "../config/db.js";
import { expensesTable, type Expense } from "../models/expense.model.js";
import { categoriesTable } from "../models/category.model.js";
import { ApiError } from "../utils/ApiError.js";
import { fmtAmount, toNumber } from "../utils/money.js";
import type { CreateExpenseInput, UpdateExpenseInput } from "../validations/expense.validation.js";

function serializeRow(e: Expense, c: { name: string; color: string }) {
  return {
    id: e.id,
    amount: toNumber(e.amount),
    categoryId: e.categoryId,
    categoryName: c.name,
    categoryColor: c.color,
    note: e.note,
    date: e.date,
    createdAt: e.createdAt.toISOString(),
  };
}

export async function listExpenses(params: { categoryId?: number; from?: string; to?: string }) {
  const conditions = [];
  if (params.categoryId) conditions.push(eq(expensesTable.categoryId, params.categoryId));
  if (params.from) conditions.push(gte(expensesTable.date, params.from));
  if (params.to) conditions.push(lte(expensesTable.date, params.to));

  const rows = await db
    .select({
      expense: expensesTable,
      category: categoriesTable,
    })
    .from(expensesTable)
    .innerJoin(categoriesTable, eq(expensesTable.categoryId, categoriesTable.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(expensesTable.date), desc(expensesTable.id));

  return rows.map((r) => serializeRow(r.expense, r.category));
}

async function getExpenseWithCategory(id: number) {
  const [row] = await db
    .select({ expense: expensesTable, category: categoriesTable })
    .from(expensesTable)
    .innerJoin(categoriesTable, eq(expensesTable.categoryId, categoriesTable.id))
    .where(eq(expensesTable.id, id));
  return row;
}

export async function createExpense(input: CreateExpenseInput) {
  try {
    const [row] = await db
      .insert(expensesTable)
      .values({
        amount: fmtAmount(input.amount),
        categoryId: input.categoryId,
        note: input.note ?? null,
        date: input.date,
      })
      .returning();
    const joined = await getExpenseWithCategory(row.id);
    return serializeRow(joined.expense, joined.category);
  } catch (err) {
    const e = err as { code?: string };
    if (e.code === "23503") throw ApiError.badRequest("Invalid categoryId");
    throw err;
  }
}

export async function updateExpense(id: number, input: UpdateExpenseInput) {
  const updates: Partial<typeof expensesTable.$inferInsert> = {};
  if (input.amount !== undefined) updates.amount = fmtAmount(input.amount);
  if (input.categoryId !== undefined) updates.categoryId = input.categoryId;
  if (input.note !== undefined) updates.note = input.note;
  if (input.date !== undefined) updates.date = input.date;
  if (Object.keys(updates).length === 0) throw ApiError.badRequest("No fields to update");

  const [row] = await db.update(expensesTable).set(updates).where(eq(expensesTable.id, id)).returning();
  if (!row) throw ApiError.notFound("Expense not found");
  const joined = await getExpenseWithCategory(row.id);
  return serializeRow(joined.expense, joined.category);
}

export async function deleteExpense(id: number) {
  const [row] = await db.delete(expensesTable).where(eq(expensesTable.id, id)).returning();
  if (!row) throw ApiError.notFound("Expense not found");
}
