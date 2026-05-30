import { Router } from "express";
import rateLimit from "express-rate-limit";

import * as appointmentController from "@/controllers/appointment.controller";
import { authenticate, optionalAuthenticate } from "@/middlewares/auth.middleware";
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
const isDevelopment = process.env.NODE_ENV !== "production";

const createAppointmentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: isDevelopment ? 300 : 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    mensaje: "Demasiadas solicitudes de cita desde este origen. Intente mas tarde.",
    errors: []
  }
});

router.get("/", authenticate, asyncHandler(appointmentController.getCitas));
router.get(
  "/availability",
  validate(appointmentAvailabilitySchema),
  asyncHandler(appointmentController.getCitaAvailability)
);
router.post(
  "/",
  createAppointmentLimiter,
  optionalAuthenticate,
  validate(appointmentSchema),
  asyncHandler(appointmentController.createCita)
);
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
