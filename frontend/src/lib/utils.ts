import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatPhone(value: string) {
  return value.replace(/[^\d+]/g, "");
}
