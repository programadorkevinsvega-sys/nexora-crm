export function formatCurrency(amount: number | string | null | undefined, currency = "USD"): string {
  if (amount === null || amount === undefined) return "—"
  const num = typeof amount === "string" ? Number.parseFloat(amount) : amount
  if (Number.isNaN(num)) return "—"
  return new Intl.NumberFormat("en-US", { style: "currency", currency, minimumFractionDigits: 2 }).format(num)
}
