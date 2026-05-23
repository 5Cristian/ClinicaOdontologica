import { Router } from "express";

import * as reportController from "@/controllers/report.controller";
import { authenticate } from "@/middlewares/auth.middleware";
import { authorize } from "@/middlewares/role.middleware";
import { asyncHandler } from "@/utils/async-handler";

const router = Router();

router.get("/summary", authenticate, authorize("ADMINISTRADOR"), asyncHandler(reportController.getSummary));

export default router;
