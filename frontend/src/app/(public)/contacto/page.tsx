import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";

import { Card } from "@/components/ui/card";
import { getConfiguracionClinica } from "@/services/public.service";

export default async function ContactPage() {
  const config = await getConfiguracionClinica().catch(() => null);

  return (
    <section className="container-shell py-16">
      <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-600">Contacto</p>
          <h1 className="mt-4 font-heading text-4xl font-bold text-slate-950">Ubicación, canales de atención y acceso rápido a WhatsApp.</h1>
          <p className="mt-4 text-lg leading-8 text-slate-600">Página pública conectada a la configuración real de la clínica en el backend.</p>
        </div>
        <Card>
          <div className="space-y-5">
            <div className="flex gap-4"><Phone className="mt-1 h-5 w-5 text-brand-600" /><div><p className="font-semibold text-slate-900">Teléfono</p><p className="text-slate-600">{config?.telefono ?? "+502 5555-0000"}</p></div></div>
            <div className="flex gap-4"><Mail className="mt-1 h-5 w-5 text-brand-600" /><div><p className="font-semibold text-slate-900">WhatsApp</p><Link href={`https://wa.me/${config?.whatsapp ?? "50255550000"}`} className="text-slate-600 hover:text-brand-700">{config?.whatsapp ?? "50255550000"}</Link></div></div>
            <div className="flex gap-4"><MapPin className="mt-1 h-5 w-5 text-brand-600" /><div><p className="font-semibold text-slate-900">Dirección</p><p className="text-slate-600">{config?.direccion ?? "Ciudad de Guatemala, Guatemala"}</p></div></div>
          </div>
        </Card>
      </div>
    </section>
  );
}
