export const currencyFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

export const dateFormatter = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export function formatCurrency(value) {
  return currencyFormatter.format(Number.isFinite(value) ? value : 0);
}

export function formatDate(value) {
  return dateFormatter.format(new Date(`${value}T00:00:00`));
}
