import { z } from "zod";

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8)
  })
});

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(3).max(120),
    email: z.string().email(),
    password: z.string().min(8).max(64),
    role: z.enum(["ADMINISTRADOR", "RECEPCION", "ODONTOLOGO"])
  })
});

export const refreshSchema = z.object({
  body: z.object({}).optional()
});
