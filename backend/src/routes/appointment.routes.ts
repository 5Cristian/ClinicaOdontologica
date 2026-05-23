import { Router } from "express";

import * as appointmentController from "@/controllers/appointment.controller";
import { authenticate } from "@/middlewares/auth.middleware";
import { authorize } from "@/middlewares/role.middleware";
import { validate } from "@/middlewares/validate.middleware";
import { asyncHandler } from "@/utils/async-handler";
import {
  appointmentAvailabilitySchema,
  citaIdSchema,
  appointmentSchema,
  appointmentStatusSchema
} from "@/validators/appointment.validator";

const router = Router();

router.get("/", authenticate, asyncHandler(appointmentController.getCitas));
router.get(
  "/availability",
  validate(appointmentAvailabilitySchema),
  asyncHandler(appointmentController.getCitaAvailability)
);
router.post("/", validate(appointmentSchema), asyncHandler(appointmentController.createCita));
router.get("/:id", authenticate, validate(citaIdSchema), asyncHandler(appointmentController.getCita));
router.put(
  "/:id",
  authenticate,
  authorize("ADMINISTRADOR", "RECEPCION"),
  validate(citaIdSchema.merge(appointmentSchema)),
  asyncHandler(appointmentController.updateCita)
);
router.patch(
  "/:id/status",
  authenticate,
  authorize("ADMINISTRADOR", "RECEPCION", "ODONTOLOGO"),
  validate(appointmentStatusSchema),
  asyncHandler(appointmentController.updateEstadoCita)
);
router.delete(
  "/:id",
  authenticate,
  authorize("ADMINISTRADOR", "RECEPCION"),
  validate(citaIdSchema),
  asyncHandler(appointmentController.deleteCita)
);

export default router;
