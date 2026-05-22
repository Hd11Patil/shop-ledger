export interface Expense {
  id: number;
  amount: number;
  categoryId: number;
  categoryName: string;
  categoryColor: string;
  note: string | null;
  date: string;
  createdAt: string;
}

export interface ExpenseInput {
  amount: number;
  categoryId: number;
  note?: string | null;
  date: string;
}
