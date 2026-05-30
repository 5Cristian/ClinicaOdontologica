import cron from "node-cron";

import { env } from "@/config/env";
import { processOneDayAppointmentReminders } from "@/services/reminder.service";

let schedulerStarted = false;

export function startReminderScheduler() {
  if (schedulerStarted) {
    return;
  }

  schedulerStarted = true;

  cron.schedule(
    env.REMINDER_CRON_EXPRESSION,
    async () => {
      try {
        await processOneDayAppointmentReminders();
      } catch (error) {
        console.error("No se pudo procesar la tarea de recordatorios automaticos.", error);
      }
    },
    {
      timezone: env.REMINDER_TIMEZONE
    }
  );
}
