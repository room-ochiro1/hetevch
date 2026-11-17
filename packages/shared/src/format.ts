/**
 * Formats an amount as Mongolian tögrög, e.g. `formatMoney(12500)` → "12,500 ₮".
 * Shared by the admin dashboard and the mobile app so both show money the same way.
 */
export function formatMoney(amount: number, currency = '₮'): string {
  const formatted = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
  }).format(amount);
  return `${formatted} ${currency}`;
}
