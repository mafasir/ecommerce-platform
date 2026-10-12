export const formatCurrency = (value, currency = "USD") =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);

export const formatDate = (iso) =>
  new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(
    new Date(iso)
  );

export const classNames = (...parts) => parts.filter(Boolean).join(" ");
