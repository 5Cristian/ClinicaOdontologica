import { apiRequest } from "@/lib/api";
import { UsuarioAutenticado } from "@/types/api";

type SessionResponse = {
  accessToken: string;
  user: UsuarioAutenticado;
};

export async function loginRequest(email: string, password: string) {
  const response = await apiRequest<SessionResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
    skipAuthRefresh: true
  });

  return response.data;
}

export async function refreshRequest() {
  const response = await apiRequest<SessionResponse>("/auth/refresh", {
    method: "POST",
    body: JSON.stringify({}),
    skipAuthRefresh: true
  });

  return response.data;
}

export async function logoutRequest() {
  return apiRequest("/auth/logout", {
    method: "POST",
    body: JSON.stringify({}),
    skipAuthRefresh: true
  });
}

export async function getMe(token: string) {
  const response = await apiRequest<UsuarioAutenticado & { activo?: boolean; creadoEn?: string }>("/auth/me", {
    token
  });

  return response.data;
}
