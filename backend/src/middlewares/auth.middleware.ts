import { NextFunction, Request, Response } from "express";

import { AppError } from "@/utils/app-error";
import { verifyAccessToken } from "@/utils/jwt";

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const authorization = req.headers.authorization;

  // Verifica que el cliente envíe un bearer token válido.
  if (!authorization?.startsWith("Bearer ")) {
    return next(new AppError("No autorizado.", 401));
  }

  const token = authorization.replace("Bearer ", "").trim();

  try {
    // Decodifica el token y deja el usuario disponible para las capas siguientes.
    req.user = verifyAccessToken(token);
    return next();
  } catch {
    return next(new AppError("Token inválido o expirado.", 401));
  }
}

export function optionalAuthenticate(req: Request, _res: Response, next: NextFunction) {
  const authorization = req.headers.authorization;

  if (!authorization) {
    return next();
  }

  if (!authorization.startsWith("Bearer ")) {
    return next(new AppError("No autorizado.", 401));
  }

  const token = authorization.replace("Bearer ", "").trim();

  try {
    req.user = verifyAccessToken(token);
    return next();
  } catch {
    return next(new AppError("Token invalido o expirado.", 401));
  }
}
