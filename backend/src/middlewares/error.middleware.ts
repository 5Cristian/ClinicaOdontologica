import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

import { errorResponse } from "@/utils/api-response";
import { AppError } from "@/utils/app-error";

export function notFoundHandler(_req: Request, _res: Response, next: NextFunction) {
  return next(new AppError("Recurso no encontrado.", 404));
}

export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (error instanceof ZodError) {
    return res.status(400).json(
      errorResponse(
        "Error de validación.",
        error.issues.map((issue) => ({
          path: issue.path.join("."),
          mensaje: issue.message
        }))
      )
    );
  }

  if (error instanceof AppError) {
    return res.status(error.statusCode).json(errorResponse(error.message, error.errors));
  }

  console.error(error);
  return res.status(500).json(errorResponse("Error interno del servidor."));
}
