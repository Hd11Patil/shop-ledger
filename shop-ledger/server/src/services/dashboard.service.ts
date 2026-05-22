import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import { db } from "../config/db.js";
import { salesTable } from "../models/sale.model.js";
import { expensesTable } from "../models/expense.model.js";
import { investmentsTable } from "../models/investment.model.js";
import { categoriesTable } from "../models/category.model.js";
import { toNumber } from "../utils/money.js";
import { todayISO, monthStartISO, daysAgoISO } from "../utils/dates.js";

async function sumSales(from: string, to: string) {
  const [row] = await db
    .select({
      total: sql<string>`coalesce(sum(${salesTable.amount}), 0)`.as("total"),
      count: sql<string>`count(*)`.as("count"),
    })
    .from(salesTable)
    .where(and(gte(salesTable.date, from), lte(salesTable.date, to)));
  return { total: toNumber(row.total), count: Number(row.count) };
}

async function sumExpenses(from: string, to: string) {
  const [row] = await db
    .select({
      total: sql<string>`coalesce(sum(${expensesTable.amount}), 0)`.as("total"),
      count: sql<string>`count(*)`.as("count"),
    })
    .from(expensesTable)
    .where(and(gte(expensesTable.date, from), lte(expensesTable.date, to)));
  return { total: toNumber(row.total), count: Number(row.count) };
}

async function sumInvestments(from: string, to: string) {
  const [row] = await db
    .select({
      total: sql<string>`coalesce(sum(${investmentsTable.amount}), 0)`.as("total"),
    })
    .from(investmentsTable)
    .where(and(gte(investmentsTable.date, from), lte(investmentsTable.date, to)));
  return toNumber(row.total);
}

export async function getSummary() {
  const today = todayISO();
  const monthStart = monthStartISO();

  const [todaySales, todayExpenses, monthSales, monthExpenses] = await Promise.all([
    sumSales(today, today),
    sumExpenses(today, today),
    sumSales(monthStart, today),
    sumExpenses(monthStart, today),
  ]);

  return {
    today: {
      sales: todaySales.total,
      salesCount: todaySales.count,
      expenses: todayExpenses.total,
      expensesCount: todayExpenses.count,
      profit: todaySales.total - todayExpenses.total,
    },
    thisMonth: {
      sales: monthSales.total,
      expenses: monthExpenses.total,
      profit: monthSales.total - monthExpenses.total,
    },
  };
}

export async function getExpenseBreakdown(params: { from?: string; to?: string }) {
  const from = params.from ?? monthStartISO();
  const to = params.to ?? todayISO();

  const rows = await db
    .select({
      categoryId: categoriesTable.id,
      categoryName: categoriesTable.name,
      categoryColor: categoriesTable.color,
      total: sql<string>`coalesce(sum(${expensesTable.amount}), 0)`.as("total"),
    })
    .from(expensesTable)
    .innerJoin(categoriesTable, eq(expensesTable.categoryId, categoriesTable.id))
    .where(and(gte(expensesTable.date, from), lte(expensesTable.date, to)))
    .groupBy(categoriesTable.id, categoriesTable.name, categoriesTable.color)
    .orderBy(desc(sql`total`));

  return rows.map((r) => ({
    categoryId: r.categoryId,
    categoryName: r.categoryName,
    categoryColor: r.categoryColor,
    total: toNumber(r.total),
  }));
}

export async function getInsights() {
  const today = todayISO();
  const thirtyDaysAgo = daysAgoISO(30);

  const [bestDayRow] = await db
    .select({
      date: salesTable.date,
      amount: sql<string>`sum(${salesTable.amount})`.as("amount"),
    })
    .from(salesTable)
    .groupBy(salesTable.date)
    .orderBy(desc(sql`amount`))
    .limit(1);

  const [topExpenseRow] = await db
    .select({
      categoryId: categoriesTable.id,
      categoryName: categoriesTable.name,
      total: sql<string>`sum(${expensesTable.amount})`.as("total"),
    })
    .from(expensesTable)
    .innerJoin(categoriesTable, eq(expensesTable.categoryId, categoriesTable.id))
    .where(and(gte(expensesTable.date, thirtyDaysAgo), lte(expensesTable.date, today)))
    .groupBy(categoriesTable.id, categoriesTable.name)
    .orderBy(desc(sql`total`))
    .limit(1);

  const [salesAgg, expensesAgg] = await Promise.all([
    sumSales(thirtyDaysAgo, today),
    sumExpenses(thirtyDaysAgo, today),
  ]);

  const [trackedRow] = await db
    .select({ count: sql<string>`count(distinct ${salesTable.date})`.as("count") })
    .from(salesTable);

  const profit30d = salesAgg.total - expensesAgg.total;
  return {
    bestSalesDay: bestDayRow ? { date: bestDayRow.date, amount: toNumber(bestDayRow.amount) } : null,
    topExpenseCategory: topExpenseRow
      ? {
          categoryId: topExpenseRow.categoryId,
          categoryName: topExpenseRow.categoryName,
          total: toNumber(topExpenseRow.total),
        }
      : null,
    avgDailyProfit30d: profit30d / 30,
    daysTracked: Number(trackedRow.count),
  };
}

type ActivityKind = "sale" | "expense" | "investment";
interface ActivityEntry {
  id: number;
  kind: ActivityKind;
  amount: number;
  label: string;
  date: string;
  createdAt: string;
}

export async function getRecentActivity(limit = 10) {
  const [sales, expenses, investments] = await Promise.all([
    db.select().from(salesTable).orderBy(desc(salesTable.createdAt)).limit(limit),
    db
      .select({
        id: expensesTable.id,
        amount: expensesTable.amount,
        note: expensesTable.note,
        date: expensesTable.date,
        createdAt: expensesTable.createdAt,
        categoryName: categoriesTable.name,
      })
      .from(expensesTable)
      .innerJoin(categoriesTable, eq(expensesTable.categoryId, categoriesTable.id))
      .orderBy(desc(expensesTable.createdAt))
      .limit(limit),
    db.select().from(investmentsTable).orderBy(desc(investmentsTable.createdAt)).limit(limit),
  ]);

  const entries: ActivityEntry[] = [
    ...sales.map<ActivityEntry>((s) => ({
      id: s.id,
      kind: "sale",
      amount: toNumber(s.amount),
      label: s.note ?? "Sale",
      date: s.date,
      createdAt: s.createdAt.toISOString(),
    })),
    ...expenses.map<ActivityEntry>((e) => ({
      id: e.id,
      kind: "expense",
      amount: toNumber(e.amount),
      label: e.note ? `${e.categoryName} — ${e.note}` : e.categoryName,
      date: e.date,
      createdAt: e.createdAt.toISOString(),
    })),
    ...investments.map<ActivityEntry>((i) => ({
      id: i.id,
      kind: "investment",
      amount: toNumber(i.amount),
      label: i.note ?? "Investment",
      date: i.date,
      createdAt: i.createdAt.toISOString(),
    })),
  ];

  entries.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return entries.slice(0, limit);
}
