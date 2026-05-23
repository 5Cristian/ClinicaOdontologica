import { Router } from "express";

import * as clinicConfigController from "@/controllers/clinic-config.controller";
import { authenticate } from "@/middlewares/auth.middleware";
import { authorize } from "@/middlewares/role.middleware";
import { validate } from "@/middlewares/validate.middleware";
import { asyncHandler } from "@/utils/async-handler";
import { clinicConfigSchema } from "@/validators/clinic-config.validator";

const router = Router();

router.get("/", asyncHandler(clinicConfigController.getConfiguracionClinica));
router.put(
  "/",
  authenticate,
  authorize("ADMINISTRADOR"),
  validate(clinicConfigSchema),
  asyncHandler(clinicConfigController.upsertConfiguracionClinica)
);

export default router;
