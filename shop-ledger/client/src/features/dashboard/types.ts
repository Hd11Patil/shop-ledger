export interface DashboardSummary {
  today: {
    sales: number;
    salesCount: number;
    expenses: number;
    expensesCount: number;
    profit: number;
  };
  thisMonth: {
    sales: number;
    expenses: number;
    profit: number;
  };
}

export interface ExpenseBreakdownItem {
  categoryId: number;
  categoryName: string;
  categoryColor: string;
  total: number;
}

export interface BusinessInsights {
  bestSalesDay: { date: string; amount: number } | null;
  topExpenseCategory: { categoryId: number; categoryName: string; total: number } | null;
  avgDailyProfit30d: number;
  daysTracked: number;
}

export type ActivityKind = "sale" | "expense" | "investment";

export interface ActivityEntry {
  id: number;
  kind: ActivityKind;
  amount: number;
  label: string;
  date: string;
  createdAt: string;
}
