import { Router } from "express";

import * as reminderController from "@/controllers/reminder.controller";
import { validateTwilioWebhook } from "@/middlewares/twilio.middleware";
import { asyncHandler } from "@/utils/async-handler";

const router = Router();

router.post(
  "/twilio/whatsapp/status",
  validateTwilioWebhook,
  asyncHandler(reminderController.handleTwilioStatusWebhook)
);
router.post(
  "/twilio/whatsapp/inbound",
  validateTwilioWebhook,
  asyncHandler(reminderController.handleTwilioInboundWebhook)
);

export default router;
