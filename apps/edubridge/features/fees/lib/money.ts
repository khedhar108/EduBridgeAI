export function formatInr(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function payableInr(
  totalAmountInr: number,
  concessionPercent: number,
): number {
  return Math.round((totalAmountInr * (100 - concessionPercent)) / 100);
}

export function headCodeFromLabel(label: string, index: number): string {
  const slug = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 32);
  return slug || `head-${index + 1}`;
}
