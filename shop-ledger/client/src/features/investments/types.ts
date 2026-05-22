export interface Investment {
  id: number;
  amount: number;
  note: string | null;
  date: string;
  createdAt: string;
}

export interface InvestmentInput {
  amount: number;
  note?: string | null;
  date: string;
}
