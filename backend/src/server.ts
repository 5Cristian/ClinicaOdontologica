import app from "@/app";
import { env } from "@/config/env";
import { startReminderScheduler } from "@/services/reminder-scheduler.service";
import { initializeWhatsappWebIfConfigured } from "@/services/whatsapp.service";

startReminderScheduler();
void initializeWhatsappWebIfConfigured();

app.listen(env.PORT, () => {
  console.log(`Backend running on http://localhost:${env.PORT}`);
});
