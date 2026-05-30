import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import path from "node:path";

import { env } from "@/config/env";
import { errorHandler, notFoundHandler } from "@/middlewares/error.middleware";
import routes from "@/routes";

const app = express();
const isDevelopment = env.NODE_ENV !== "production";

// Oculta la firma de Express en las respuestas HTTP.
app.disable("x-powered-by");

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
  })
);

// Permite solo el frontend configurado como consumidor del backend.
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || origin === env.FRONTEND_URL) {
        return callback(null, true);
      }

      return callback(new Error("Origen no permitido por CORS."));
    },
    credentials: true
  })
);

// Limita el volumen total de solicitudes para reducir abuso básico.
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: isDevelopment ? 5000 : 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      mensaje: "Demasiadas solicitudes. Intente más tarde.",
      errors: []
    }
  })
);

app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));
// Habilita lectura de cookies para el flujo de refresh token.
app.use(cookieParser());
app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));
// Restringe el tamaño del payload para evitar cargas excesivas.
app.use(express.json({ limit: "6mb" }));
app.use(express.urlencoded({ extended: false, limit: "10kb" }));
// Adjunta contexto básico de la petición para auditoría y trazabilidad.
app.use((req, _res, next) => {
  req.auditContext = {
    ipAddress: req.ip || req.socket.remoteAddress || null,
    userAgent: typeof req.headers["user-agent"] === "string" ? req.headers["user-agent"] : null
  };
  next();
});

app.get("/health", (_req, res) => {
  res.json({
    success: true,
    mensaje: "API operativa.",
    data: {
      estado: "ok"
    }
  });
});

app.use("/api", routes);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
