import { z } from "zod";

export const uploadImageSchema = z.object({
  body: z.object({
    category: z.enum(["treatments", "clinic"]),
    fileName: z.string().min(1).max(180),
    mimeType: z.enum(["image/jpeg", "image/png", "image/webp"]),
    dataBase64: z.string().min(100)
  })
});

export const deleteImageSchema = z.object({
  body: z.object({
    path: z.string().startsWith("/uploads/")
  })
});
