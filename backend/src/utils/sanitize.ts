export function sanitizeValue<T>(value: T): T {
  if (typeof value === "string") {
    return value.replace(/\0/g, "").trim() as T;
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item)) as T;
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, entry]) => [key, sanitizeValue(entry)])
    ) as T;
  }

  return value;
}
