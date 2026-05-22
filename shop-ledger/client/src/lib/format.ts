import { format, parseISO } from "date-fns";

export function formatCurrency(amount: number, symbol: string = "₹") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    currencyDisplay: "symbol",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount).replace("₹", symbol);
}

export function formatDate(dateStr: string) {
  try {
    return format(parseISO(dateStr), "dd MMM yyyy");
  } catch (e) {
    return dateStr;
  }
}

export function formatDateTime(dateStr: string) {
  try {
    return format(parseISO(dateStr), "dd MMM yyyy, h:mm a");
  } catch (e) {
    return dateStr;
  }
}
