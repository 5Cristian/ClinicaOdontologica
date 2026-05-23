import { Card } from "@/components/ui/card";
import { getTratamientos } from "@/services/public.service";

export default async function ServicesPage() {
  const treatments = await getTratamientos().catch(() => []);

  return (
    <section className="container-shell py-16">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-600">Servicios</p>
        <h1 className="mt-4 font-heading text-4xl font-bold text-slate-950">Portafolio odontológico para prevención, estética y rehabilitación.</h1>
        <p className="mt-4 text-lg leading-8 text-slate-600">Los tratamientos son servidos por el backend y consumidos vía API REST.</p>
      </div>
      <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {treatments.map((treatment) => (
          <Card key={treatment.id}>
            <h2 className="font-heading text-2xl font-bold text-slate-950">{treatment.name}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">{treatment.descripcion}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}
