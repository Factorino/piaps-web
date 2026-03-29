export function formatMoney(value: number | string | undefined | null): string {
  if (value == null) return "—";
  const num = typeof value === "string" ? parseFloat(value) : value;
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    minimumFractionDigits: 2,
  }).format(num);
}

export function formatDate(dateStr: string | undefined | null): string {
  if (!dateStr) return "—";
  try {
    return new Intl.DateTimeFormat("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

export function formatPeriod(dateStr: string | undefined | null): string {
  if (!dateStr) return "—";
  try {
    return new Intl.DateTimeFormat("ru-RU", {
      month: "long",
      year: "numeric",
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

export function fullName(
  last: string,
  first: string,
  middle?: string | null,
): string {
  return [last, first, middle].filter(Boolean).join(" ");
}

export function shortName(
  last: string,
  first: string,
  middle?: string | null,
): string {
  let s = `${last} ${first[0]}.`;
  if (middle) s += `${middle[0]}.`;
  return s;
}
