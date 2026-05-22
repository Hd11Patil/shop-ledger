import { pgTable, serial, integer, numeric, varchar, date, timestamp, index } from "drizzle-orm/pg-core";
import { categoriesTable } from "./category.model.js";

export const expensesTable = pgTable(
  "expenses",
  {
    id: serial("id").primaryKey(),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    categoryId: integer("category_id")
      .notNull()
      .references(() => categoriesTable.id, { onDelete: "restrict" }),
    note: varchar("note", { length: 500 }),
    date: date("date").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("expenses_date_idx").on(t.date), index("expenses_category_idx").on(t.categoryId)],
);

export type Expense = typeof expensesTable.$inferSelect;
export type InsertExpense = typeof expensesTable.$inferInsert;
