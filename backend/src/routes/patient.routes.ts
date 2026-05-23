import { Router } from "express";

import * as patientController from "@/controllers/patient.controller";
import { authenticate } from "@/middlewares/auth.middleware";
import { authorize } from "@/middlewares/role.middleware";
import { validate } from "@/middlewares/validate.middleware";
import { asyncHandler } from "@/utils/async-handler";
import { pacienteIdSchema, patientSchema } from "@/validators/patient.validator";

const router = Router();

router.use(authenticate);

router.get("/", asyncHandler(patientController.getPacientes));
router.post("/", authorize("ADMINISTRADOR", "RECEPCION"), validate(patientSchema), asyncHandler(patientController.createPaciente));
router.get("/:id", validate(pacienteIdSchema), asyncHandler(patientController.getPaciente));
router.put(
  "/:id",
  authorize("ADMINISTRADOR", "RECEPCION"),
  validate(pacienteIdSchema.merge(patientSchema)),
  asyncHandler(patientController.updatePaciente)
);
router.delete("/:id", authorize("ADMINISTRADOR"), validate(pacienteIdSchema), asyncHandler(patientController.deletePaciente));

export default router;
