export type Period = "daily" | "monthly" | "yearly";

export interface ReportBucket {
  key: string;
  label: string;
  date: string;
  sales: number;
  expenses: number;
  investments: number;
  profit: number;
}

export interface PeriodReport {
  period: Period;
  from: string;
  to: string;
  buckets: ReportBucket[];
}
