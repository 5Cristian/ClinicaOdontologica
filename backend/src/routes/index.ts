import { Router } from "express";

import appointmentRoutes from "@/routes/appointment.routes";
import auditLogRoutes from "@/routes/audit-log.routes";
import authRoutes from "@/routes/auth.routes";
import clinicalRecordRoutes from "@/routes/clinical-record.routes";
import clinicConfigRoutes from "@/routes/clinic-config.routes";
import patientRoutes from "@/routes/patient.routes";
import reportRoutes from "@/routes/report.routes";
import reminderRoutes from "@/routes/reminder.routes";
import treatmentRoutes from "@/routes/treatment.routes";
import userRoutes from "@/routes/user.routes";
import webhookRoutes from "@/routes/webhook.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/patients", patientRoutes);
router.use("/citas", appointmentRoutes);
router.use("/audit-logs", auditLogRoutes);
router.use("/treatments", treatmentRoutes);
router.use("/users", userRoutes);
router.use("/reports", reportRoutes);
router.use("/clinical-records", clinicalRecordRoutes);
router.use("/reminders", reminderRoutes);
router.use("/clinic-config", clinicConfigRoutes);
router.use("/webhooks", webhookRoutes);

export default router;
