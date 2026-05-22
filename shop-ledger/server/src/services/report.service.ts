import { and, gte, lte, sql } from "drizzle-orm";
import { db } from "../config/db.js";
import { salesTable } from "../models/sale.model.js";
import { expensesTable } from "../models/expense.model.js";
import { investmentsTable } from "../models/investment.model.js";
import { toNumber } from "../utils/money.js";
import {
  todayISO,
  daysAgoISO,
  monthKey,
  yearKey,
  monthLabel,
  dayLabel,
  addDaysISO,
  diffDays,
} from "../utils/dates.js";
import type { PeriodReportQuery } from "../validations/settings.validation.js";

interface Bucket {
  key: string;
  label: string;
  date: string;
  sales: number;
  expenses: number;
  investments: number;
  profit: number;
}

function defaultRange(period: "daily" | "monthly" | "yearly"): { from: string; to: string } {
  const to = todayISO();
  if (period === "daily") return { from: daysAgoISO(29), to };
  if (period === "monthly") {
    const [y, m] = to.split("-").map(Number);
    const fromMonth = m - 11;
    const fromYear = y + Math.floor((fromMonth - 1) / 12);
    const adjMonth = ((fromMonth - 1) % 12 + 12) % 12 + 1;
    return { from: `${fromYear}-${String(adjMonth).padStart(2, "0")}-01`, to };
  }
  // yearly
  const [y] = to.split("-").map(Number);
  return { from: `${y - 4}-01-01`, to };
}

export async function getPeriodReport(params: PeriodReportQuery) {
  const period = params.period;
  const range =
    params.from && params.to ? { from: params.from, to: params.to } : defaultRange(period);

  const [salesRows, expensesRows, investmentsRows] = await Promise.all([
    db
      .select({
        date: salesTable.date,
        amount: sql<string>`sum(${salesTable.amount})`.as("amount"),
      })
      .from(salesTable)
      .where(and(gte(salesTable.date, range.from), lte(salesTable.date, range.to)))
      .groupBy(salesTable.date),
    db
      .select({
        date: expensesTable.date,
        amount: sql<string>`sum(${expensesTable.amount})`.as("amount"),
      })
      .from(expensesTable)
      .where(and(gte(expensesTable.date, range.from), lte(expensesTable.date, range.to)))
      .groupBy(expensesTable.date),
    db
      .select({
        date: investmentsTable.date,
        amount: sql<string>`sum(${investmentsTable.amount})`.as("amount"),
      })
      .from(investmentsTable)
      .where(and(gte(investmentsTable.date, range.from), lte(investmentsTable.date, range.to)))
      .groupBy(investmentsTable.date),
  ]);

  const buckets = new Map<string, Bucket>();

  function ensure(key: string, label: string, date: string): Bucket {
    let b = buckets.get(key);
    if (!b) {
      b = { key, label, date, sales: 0, expenses: 0, investments: 0, profit: 0 };
      buckets.set(key, b);
    }
    return b;
  }

  function bucketKey(date: string): { key: string; label: string; date: string } {
    if (period === "daily") return { key: date, label: dayLabel(date), date };
    if (period === "monthly") {
      const k = monthKey(date);
      return { key: k, label: monthLabel(k), date: `${k}-01` };
    }
    const k = yearKey(date);
    return { key: k, label: k, date: `${k}-01-01` };
  }

  // Pre-fill empty buckets so the chart x-axis is continuous.
  if (period === "daily") {
    const days = diffDays(range.from, range.to);
    for (let i = 0; i <= days; i++) {
      const d = addDaysISO(range.from, i);
      const k = bucketKey(d);
      ensure(k.key, k.label, k.date);
    }
  } else if (period === "monthly") {
    const [fy, fm] = range.from.split("-").map(Number);
    const [ty, tm] = range.to.split("-").map(Number);
    const totalMonths = (ty - fy) * 12 + (tm - fm);
    for (let i = 0; i <= totalMonths; i++) {
      const month = fm + i;
      const year = fy + Math.floor((month - 1) / 12);
      const adjMonth = ((month - 1) % 12 + 12) % 12 + 1;
      const dateStr = `${year}-${String(adjMonth).padStart(2, "0")}-01`;
      const k = bucketKey(dateStr);
      ensure(k.key, k.label, k.date);
    }
  } else {
    const fy = Number(range.from.slice(0, 4));
    const ty = Number(range.to.slice(0, 4));
    for (let y = fy; y <= ty; y++) {
      const k = bucketKey(`${y}-01-01`);
      ensure(k.key, k.label, k.date);
    }
  }

  for (const r of salesRows) {
    const k = bucketKey(r.date);
    ensure(k.key, k.label, k.date).sales += toNumber(r.amount);
  }
  for (const r of expensesRows) {
    const k = bucketKey(r.date);
    ensure(k.key, k.label, k.date).expenses += toNumber(r.amount);
  }
  for (const r of investmentsRows) {
    const k = bucketKey(r.date);
    ensure(k.key, k.label, k.date).investments += toNumber(r.amount);
  }

  const result = Array.from(buckets.values());
  result.forEach((b) => {
    b.profit = b.sales - b.expenses;
  });
  result.sort((a, b) => (a.date < b.date ? -1 : 1));

  return {
    period,
    from: range.from,
    to: range.to,
    buckets: result,
  };
}
