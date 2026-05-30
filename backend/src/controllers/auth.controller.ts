import { Request, Response } from "express";
import { RolNombre } from "@prisma/client";

import * as authService from "@/services/auth.service";
import { successResponse } from "@/utils/api-response";

const REFRESH_COOKIE_NAME = "clinica_refresh_token";
const isProduction = process.env.NODE_ENV === "production";

function applyRefreshCookie(res: Response, refreshToken: string) {
  // Mantiene el refresh token fuera de JavaScript usando cookie HttpOnly.
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, {
    httpOnly: true,
    sameSite: isProduction ? "none" : "lax",
    secure: isProduction,
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
}

function clearRefreshCookie(res: Response) {
  res.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: true,
    sameSite: isProduction ? "none" : "lax",
    secure: isProduction,
    path: "/"
  });
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;
  const session = await authService.login(email, password);
  applyRefreshCookie(res, session.refreshToken);
  return res.json(
    successResponse("Inicio de sesión exitoso.", {
      accessToken: session.accessToken,
      user: session.user
    })
  );
}

export async function refresh(req: Request, res: Response) {
  const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME] as string | undefined;
  const session = await authService.refreshSession(refreshToken ?? "");
  applyRefreshCookie(res, session.refreshToken);
  return res.json(
    successResponse("Sesión renovada correctamente.", {
      accessToken: session.accessToken,
      user: session.user
    })
  );
}

export async function logout(req: Request, res: Response) {
  const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME] as string | undefined;
  await authService.logout(refreshToken);
  clearRefreshCookie(res);
  return res.json(successResponse("Sesión cerrada correctamente."));
}

export async function register(req: Request, res: Response) {
  const { name, email, password, role } = req.body;
  const data = await authService.registerUser({ name, email, password, role: role as RolNombre }, req.user?.id);
  return res.status(201).json(successResponse("Usuario creado correctamente.", data));
}

export async function me(req: Request, res: Response) {
  const data = await authService.getCurrentUser(req.user!.id);
  return res.json(successResponse("Perfil obtenido correctamente.", data));
}
