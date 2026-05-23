import { NextFunction, Request, Response } from "express";
import { RolNombre } from "@prisma/client";

import { AppError } from "@/utils/app-error";

export function authorize(...roles: RolNombre[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError("No autorizado.", 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError("No tiene permisos para realizar esta acción.", 403));
    }

    return next();
  };
}
