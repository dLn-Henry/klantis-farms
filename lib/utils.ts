export function formatCurrency(amount: number, currency: string = "GHS"): string {
  return `${currency} ${amount.toFixed(2)}`;
}
