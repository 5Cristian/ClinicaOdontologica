import { Request, Response } from "express";

import * as mediaService from "@/services/media.service";
import { successResponse } from "@/utils/api-response";

export async function uploadImage(req: Request, res: Response) {
  const data = await mediaService.uploadImage(req.body);
  return res.status(201).json(successResponse("Imagen subida correctamente.", data));
}

export async function deleteImage(req: Request, res: Response) {
  await mediaService.deleteImage(req.body.path);
  return res.json(successResponse("Imagen eliminada correctamente."));
}
