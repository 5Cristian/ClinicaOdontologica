import { API_URL } from "@/lib/api";

const API_ORIGIN = API_URL.replace(/\/api\/?$/, "");

export function resolveMediaUrl(path?: string | null) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  if (path.startsWith("/")) return `${API_ORIGIN}${path}`;
  return `${API_ORIGIN}/${path}`;
}
