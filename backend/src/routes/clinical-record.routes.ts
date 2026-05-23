import { Router } from "express";

import * as clinicalRecordController from "@/controllers/clinical-record.controller";
import { authenticate } from "@/middlewares/auth.middleware";
import { authorize } from "@/middlewares/role.middleware";
import { validate } from "@/middlewares/validate.middleware";
import { asyncHandler } from "@/utils/async-handler";
import {
  clinicalRecordIdSchema,
  clinicalRecordSchema
} from "@/validators/clinical-record.validator";

const router = Router();

router.use(authenticate);
router.get("/", asyncHandler(clinicalRecordController.getRegistroClinicos));
router.get("/:id", validate(clinicalRecordIdSchema), asyncHandler(clinicalRecordController.getRegistroClinico));
router.post(
  "/",
  authorize("ADMINISTRADOR", "ODONTOLOGO"),
  validate(clinicalRecordSchema),
  asyncHandler(clinicalRecordController.createRegistroClinico)
);
router.put(
  "/:id",
  authorize("ADMINISTRADOR", "ODONTOLOGO"),
  validate(clinicalRecordIdSchema.merge(clinicalRecordSchema)),
  asyncHandler(clinicalRecordController.updateRegistroClinico)
);
router.delete(
  "/:id",
  authorize("ADMINISTRADOR", "ODONTOLOGO"),
  validate(clinicalRecordIdSchema),
  asyncHandler(clinicalRecordController.deleteRegistroClinico)
);

export default router;
