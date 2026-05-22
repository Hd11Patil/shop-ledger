export function toNumber(value: string | number | null | undefined): number {
  if (value == null) return 0;
  if (typeof value === "number") return value;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

export function fmtAmount(value: string | number | null | undefined): string {
  return toNumber(value).toFixed(2);
}
