import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

import { env } from "@/config/env";
import { AppError } from "@/utils/app-error";

const UPLOAD_ROOT = path.resolve(process.cwd(), "uploads");
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Map<string, string>([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"]
]);

type UploadImageInput = {
  category: "treatments" | "clinic";
  fileName: string;
  mimeType: string;
  dataBase64: string;
};

function sanitizeBaseName(fileName: string) {
  const baseName = path.parse(fileName).name;
  return baseName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

function normalizeStoredPath(storedPath: string) {
  if (!storedPath.startsWith("/uploads/")) {
    throw new AppError("Ruta de archivo invalida.", 400);
  }

  const relativePath = storedPath.replace(/^\/+/, "");
  const absolutePath = path.resolve(process.cwd(), relativePath);
  const normalizedRoot = `${UPLOAD_ROOT}${path.sep}`;

  if (!absolutePath.startsWith(normalizedRoot)) {
    throw new AppError("Ruta fuera del directorio permitido.", 400);
  }

  return { absolutePath };
}

async function ensureDirectoryExists(directoryPath: string) {
  await fs.mkdir(directoryPath, { recursive: true });
}

export async function uploadImage(input: UploadImageInput) {
  const extension = ALLOWED_MIME_TYPES.get(input.mimeType);
  if (!extension) {
    throw new AppError("Solo se permiten imagenes JPG, PNG o WEBP.", 400);
  }

  const buffer = Buffer.from(input.dataBase64, "base64");
  if (!buffer.length || buffer.length > MAX_FILE_SIZE_BYTES) {
    throw new AppError("La imagen excede el limite permitido de 5 MB.", 400);
  }

  const categoryDirectory = path.join(UPLOAD_ROOT, input.category);
  await ensureDirectoryExists(categoryDirectory);

  const fileBaseName = sanitizeBaseName(input.fileName) || input.category;
  const generatedFileName = `${fileBaseName}-${randomUUID()}${extension}`;
  const absolutePath = path.join(categoryDirectory, generatedFileName);

  await fs.writeFile(absolutePath, buffer);

  const relativePath = `/uploads/${input.category}/${generatedFileName}`;
  return {
    path: relativePath,
    url: `${env.APP_BASE_URL}${relativePath}`
  };
}

export async function deleteImage(storedPath: string) {
  const { absolutePath } = normalizeStoredPath(storedPath);

  try {
    await fs.unlink(absolutePath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return;
    }

    throw error;
  }
}
