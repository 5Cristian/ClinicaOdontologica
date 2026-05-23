import Link from "next/link";
import { CalendarDays, MapPin, ShieldCheck, Sparkles, Stethoscope, Timer } from "lucide-react";

import { Card } from "@/components/ui/card";
import { getConfiguracionClinica, getTratamientos } from "@/services/public.service";

const highlights = [
  {
    title: "Odontología preventiva",
    description: "Control profesional y seguimiento temprano para evitar complicaciones mayores.",
    icon: ShieldCheck
  },
  {
    title: "Agenda organizada",
    description: "Reservas rápidas, horarios definidos y atención puntual para cada paciente.",
    icon: CalendarDays
  },
  {
    title: "Experiencia confiable",
    description: "Comunicación clara, ambiente profesional y enfoque humano en cada visita.",
    icon: Sparkles
  }
];

export default async function HomePage() {
  const [treatments, config] = await Promise.all([getTratamientos().catch(() => []), getConfiguracionClinica().catch(() => null)]);

  return (
    <div className="pb-16">
      <section className="bg-hero-grid">
        <div className="container-shell grid gap-12 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:py-24">
          <div className="space-y-8">
            <span className="inline-flex rounded-full bg-brand-100 px-4 py-2 text-sm font-semibold text-brand-700">Clínica odontológica moderna</span>
            <div className="space-y-5">
              <h1 className="max-w-3xl font-heading text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                Atención dental profesional con reservas en línea y seguimiento real.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-600">
                Frontend desacoplado del backend para una clínica odontológica real: página pública, solicitud de citas y panel administrativo conectado por API REST.
              </p>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link href="/reservar" className="inline-flex items-center justify-center rounded-full bg-brand-600 px-6 py-3 font-semibold text-white hover:bg-brand-700">
                Reservar cita
              </Link>
              <Link href="/servicios" className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3 font-semibold text-slate-900 hover:bg-slate-50">
                Ver servicios
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <Card className="border-none bg-white/85"><div className="flex items-center gap-3"><Timer className="h-5 w-5 text-brand-600" /><div><p className="text-sm font-semibold text-slate-900">Horario</p><p className="text-sm text-slate-600">Lun a sáb</p></div></div></Card>
              <Card className="border-none bg-white/85"><div className="flex items-center gap-3"><MapPin className="h-5 w-5 text-brand-600" /><div><p className="text-sm font-semibold text-slate-900">Ubicación</p><p className="text-sm text-slate-600">Ciudad de Guatemala</p></div></div></Card>
              <Card className="border-none bg-white/85"><div className="flex items-center gap-3"><Stethoscope className="h-5 w-5 text-brand-600" /><div><p className="text-sm font-semibold text-slate-900">Servicios</p><p className="text-sm text-slate-600">{treatments.length} activos</p></div></div></Card>
            </div>
          </div>
          <Card className="overflow-hidden bg-slate-950 p-0 text-white">
            <div className="bg-gradient-to-br from-brand-600 via-brand-700 to-slate-950 p-8">
              <p className="text-sm uppercase tracking-[0.3em] text-brand-100">Clínica destacada</p>
              <h2 className="mt-4 font-heading text-3xl font-bold">Diagnóstico claro, tratamientos bien planificados y una experiencia organizada.</h2>
              <div className="mt-8 grid gap-4">
                {highlights.map((item) => (
                  <div key={item.title} className="rounded-3xl border border-white/10 bg-white/10 p-4">
                    <item.icon className="mb-3 h-5 w-5 text-mint-300" />
                    <p className="font-semibold">{item.title}</p>
                    <p className="mt-1 text-sm text-slate-200">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid gap-4 bg-white p-8 text-slate-900 sm:grid-cols-2">
              <div><p className="text-sm text-slate-500">Teléfono</p><p className="font-semibold">{config?.telefono ?? "+502 5555-0000"}</p></div>
              <div><p className="text-sm text-slate-500">WhatsApp</p><p className="font-semibold">{config?.whatsapp ?? "50255550000"}</p></div>
              <div className="sm:col-span-2"><p className="text-sm text-slate-500">Horario de atención</p><p className="font-semibold">{config?.horarioAtencion ?? "Lunes a Viernes de 8:00 a 18:00, Sábado de 8:00 a 13:00"}</p></div>
            </div>
          </Card>
        </div>
      </section>

      <section className="container-shell py-16">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-600">Servicios</p>
            <h2 className="mt-3 font-heading text-3xl font-bold text-slate-950">Tratamientos odontológicos disponibles</h2>
          </div>
          <Link href="/servicios" className="text-sm font-semibold text-brand-700 hover:text-brand-800">Ver catálogo completo</Link>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {treatments.slice(0, 6).map((treatment) => (
            <Card key={treatment.id}>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-mint-600">Odontología</p>
              <h3 className="mt-3 font-heading text-xl font-bold text-slate-950">{treatment.name}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{treatment.descripcion}</p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
