import { Router } from "express";

import * as mediaController from "@/controllers/media.controller";
import { authenticate } from "@/middlewares/auth.middleware";
import { authorize } from "@/middlewares/role.middleware";
import { validate } from "@/middlewares/validate.middleware";
import { asyncHandler } from "@/utils/async-handler";
import { deleteImageSchema, uploadImageSchema } from "@/validators/media.validator";

const router = Router();

router.post(
  "/images",
  authenticate,
  authorize("ADMINISTRADOR"),
  validate(uploadImageSchema),
  asyncHandler(mediaController.uploadImage)
);

router.delete(
  "/images",
  authenticate,
  authorize("ADMINISTRADOR"),
  validate(deleteImageSchema),
  asyncHandler(mediaController.deleteImage)
);

export default router;
