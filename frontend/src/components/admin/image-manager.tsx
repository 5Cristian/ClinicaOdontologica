"use client";

import { ChangeEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast-provider";
import { resolveMediaUrl } from "@/lib/media";
import { deleteAdminImage, uploadAdminImage } from "@/services/admin.service";

const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/webp"];

type ImageManagerProps = {
  token?: string | null;
  category: "treatments" | "clinic";
  images: string[];
  protectedImages?: string[];
  onChange: (nextImages: string[]) => void;
  maxImages: number;
  title: string;
  helperText: string;
  allowUrl?: boolean;
};

function toBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        reject(new Error("No se pudo leer el archivo."));
        return;
      }

      const [, dataBase64] = result.split(",");
      resolve(dataBase64 ?? "");
    };
    reader.onerror = () => reject(new Error("No se pudo leer el archivo."));
    reader.readAsDataURL(file);
  });
}

export function ImageManager({
  token,
  category,
  images,
  protectedImages = [],
  onChange,
  maxImages,
  title,
  helperText,
  allowUrl = true
}: ImageManagerProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualUrl, setManualUrl] = useState("");
  const { showToast } = useToast();

  function pushError(message: string) {
    setError(message);
    showToast(message, "error");
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file || !token) return;
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      pushError("Solo puedes subir JPG, PNG o WEBP.");
      return;
    }
    if (images.length >= maxImages) {
      pushError(`Solo puedes guardar hasta ${maxImages} imagenes.`);
      return;
    }

    setBusy(true);
    setError(null);

    try {
      const dataBase64 = await toBase64(file);
      const uploaded = await uploadAdminImage(token, {
        category,
        fileName: file.name,
        mimeType: file.type,
        dataBase64
      });

      onChange([...images, uploaded.path]);
      showToast("Imagen subida correctamente.", "success");
    } catch (uploadError) {
      pushError(uploadError instanceof Error ? uploadError.message : "No se pudo subir la imagen.");
    } finally {
      setBusy(false);
    }
  }

  function handleAddUrl() {
    const value = manualUrl.trim();
    if (!value) return;
    if (!/^https?:\/\//i.test(value)) {
      pushError("El enlace debe iniciar con http:// o https://");
      return;
    }
    if (images.length >= maxImages) {
      pushError(`Solo puedes guardar hasta ${maxImages} imagenes.`);
      return;
    }
    if (images.includes(value)) {
      pushError("Ese enlace ya fue agregado.");
      return;
    }

    onChange([...images, value]);
    setManualUrl("");
    setError(null);
    showToast("Enlace de imagen agregado correctamente.", "success");
  }

  async function handleRemove(imagePath: string) {
    if (!token && imagePath.startsWith("/uploads/")) return;

    setBusy(true);
    setError(null);

    try {
      if (imagePath.startsWith("/uploads/") && !protectedImages.includes(imagePath) && token) {
        await deleteAdminImage(token, imagePath);
      }

      onChange(images.filter((currentPath) => currentPath !== imagePath));
      showToast("Imagen eliminada correctamente.", "success");
    } catch (removeError) {
      pushError(removeError instanceof Error ? removeError.message : "No se pudo eliminar la imagen.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4 rounded-3xl border border-slate-200 p-4">
      <div className="space-y-1">
        <h3 className="font-semibold text-slate-900">{title}</h3>
        <p className="text-sm text-slate-600">{helperText}</p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <label className="inline-flex cursor-pointer items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileChange}
            disabled={busy || !token || images.length >= maxImages}
          />
          {busy ? "Procesando..." : "Subir imagen"}
        </label>
        <span className="text-xs text-slate-500">
          {images.length}/{maxImages} imagenes
        </span>
      </div>
      {allowUrl ? (
        <div className="flex flex-col gap-3 md:flex-row">
          <Input value={manualUrl} onChange={(event) => setManualUrl(event.target.value)} placeholder="https://ejemplo.com/imagen.jpg" />
          <Button type="button" variant="secondary" onClick={handleAddUrl} disabled={busy || images.length >= maxImages}>
            Agregar enlace
          </Button>
        </div>
      ) : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {images.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {images.map((imagePath) => (
            <div key={imagePath} className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50">
              <img src={resolveMediaUrl(imagePath)} alt="Imagen subida" className="h-44 w-full object-cover" />
              <div className="space-y-3 p-3">
                <p className="truncate text-xs text-slate-500">{imagePath}</p>
                <Button type="button" variant="danger" onClick={() => void handleRemove(imagePath)} disabled={busy}>
                  Eliminar
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-300 p-5 text-sm text-slate-500">
          No hay imagenes cargadas todavia.
        </div>
      )}
    </div>
  );
}
