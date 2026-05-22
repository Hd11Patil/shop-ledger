export const APP_NAME = "Shop Ledger";

export const DEFAULT_CURRENCY = "INR";
export const DEFAULT_CURRENCY_SYMBOL = "₹";

export const PERIODS = ["daily", "monthly", "yearly"] as const;
export type Period = (typeof PERIODS)[number];
