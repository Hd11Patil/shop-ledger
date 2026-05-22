import { pgTable, serial, numeric, varchar, date, timestamp, index } from "drizzle-orm/pg-core";

export const investmentsTable = pgTable(
  "investments",
  {
    id: serial("id").primaryKey(),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    note: varchar("note", { length: 500 }),
    date: date("date").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("investments_date_idx").on(t.date)],
);

export type Investment = typeof investmentsTable.$inferSelect;
export type InsertInvestment = typeof investmentsTable.$inferInsert;
