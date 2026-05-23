import { RolNombre } from "@prisma/client";

export type UsuarioAutenticado = {
  id: string;
  email: string;
  role: RolNombre;
};

declare global {
  namespace Express {
    type RequestAuditContext = {
      ipAddress?: string | null;
      userAgent?: string | null;
    };

    interface Request {
      user?: UsuarioAutenticado;
      auditContext?: RequestAuditContext;
    }
  }
}

export {};
