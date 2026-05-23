import { ApiError, ApiSuccess } from "@/types/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

type RequestOptions = RequestInit & {
  token?: string | null;
  skipAuthRefresh?: boolean;
};

type RefreshHandler = () => Promise<string | null>;

let refreshHandler: RefreshHandler | null = null;

export function registerRefreshHandler(handler: RefreshHandler | null) {
  refreshHandler = handler;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<ApiSuccess<T>> {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  if (options.token) {
    headers.set("Authorization", `Bearer ${options.token}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    cache: "no-store",
    credentials: "include"
  });

  if (response.status === 401 && !options.skipAuthRefresh && refreshHandler) {
    // Intenta renovar el access token una vez antes de propagar el error al cliente.
    const refreshedToken = await refreshHandler();

    if (refreshedToken) {
      return apiRequest<T>(path, {
        ...options,
        token: refreshedToken,
        skipAuthRefresh: true
      });
    }
  }

  const data = (await response.json()) as ApiSuccess<T> | ApiError;

  if (!response.ok || !data.success) {
    const error = data as ApiError;
    const validationDetails = error.errors
      ?.map((issue) => issue.mensaje)
      .filter((message): message is string => Boolean(message))
      .join(" ");

    throw new Error(validationDetails || error.mensaje || "Error en la solicitud.");
  }

  return data as ApiSuccess<T>;
}

export { API_URL };
