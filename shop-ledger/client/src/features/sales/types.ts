export interface Sale {
  id: number;
  amount: number;
  note: string | null;
  date: string;
  createdAt: string;
}

export interface SaleInput {
  amount: number;
  note?: string | null;
  date: string;
}
