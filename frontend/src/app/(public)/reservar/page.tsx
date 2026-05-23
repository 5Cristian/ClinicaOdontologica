import { CitaForm } from "@/components/forms/appointment-form";
import { Card } from "@/components/ui/card";
import { getTratamientos } from "@/services/public.service";

export default async function ReservePage() {
  const treatments = await getTratamientos().catch(() => []);

  return (
    <section className="container-shell py-16">
      <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-600">Reservar cita</p>
          <h1 className="mt-4 font-heading text-4xl font-bold text-slate-950">Solicitud pública de citas conectada al backend.</h1>
          <p className="mt-4 text-lg leading-8 text-slate-600">El frontend envía la solicitud al backend Express y este valida, persiste y evita horarios duplicados.</p>
        </div>
        <Card>
          <CitaForm treatments={treatments.map((item) => ({ id: item.id, name: item.name }))} />
        </Card>
      </div>
    </section>
  );
}
