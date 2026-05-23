import { Router } from "express";

import * as treatmentController from "@/controllers/treatment.controller";
import { authenticate } from "@/middlewares/auth.middleware";
import { authorize } from "@/middlewares/role.middleware";
import { validate } from "@/middlewares/validate.middleware";
import { asyncHandler } from "@/utils/async-handler";
import { tratamientoIdSchema, treatmentSchema } from "@/validators/treatment.validator";

const router = Router();

router.get("/", asyncHandler(treatmentController.getTratamientos));
router.post(
  "/",
  authenticate,
  authorize("ADMINISTRADOR", "RECEPCION"),
  validate(treatmentSchema),
  asyncHandler(treatmentController.createTratamiento)
);
router.put(
  "/:id",
  authenticate,
  authorize("ADMINISTRADOR", "RECEPCION"),
  validate(tratamientoIdSchema.merge(treatmentSchema)),
  asyncHandler(treatmentController.updateTratamiento)
);
router.delete(
  "/:id",
  authenticate,
  authorize("ADMINISTRADOR"),
  validate(tratamientoIdSchema),
  asyncHandler(treatmentController.deleteTratamiento)
);

export default router;
