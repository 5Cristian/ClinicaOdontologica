import { Card } from "@/components/ui/card";
import { resolveClinicContent } from "@/lib/clinic-content";
import { resolveMediaUrl } from "@/lib/media";
import { getConfiguracionClinica, getTratamientos } from "@/services/public.service";

export default async function ServicesPage() {
  const [treatments, config] = await Promise.all([getTratamientos().catch(() => []), getConfiguracionClinica().catch(() => null)]);
  const content = resolveClinicContent(config);

  return (
    <section className="container-shell py-16">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-600">Servicios</p>
        <h1 className="mt-4 font-heading text-4xl font-bold text-slate-950">{content.tituloPaginaServicios}</h1>
        <p className="mt-4 text-lg leading-8 text-slate-600">{content.descripcionPaginaServicios}</p>
      </div>
      <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {treatments.map((treatment) => (
          <Card key={treatment.id} className="overflow-hidden p-0">
            {treatment.imagenes?.[0] ? (
              <img
                src={resolveMediaUrl(treatment.imagenes[0])}
                alt={treatment.name}
                className="h-52 w-full object-cover"
              />
            ) : null}
            <div className="p-6">
              <h2 className="font-heading text-2xl font-bold text-slate-950">{treatment.name}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">{treatment.descripcion}</p>
              {treatment.imagenes?.length > 1 ? (
                <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">
                  {treatment.imagenes.length} imagenes disponibles
                </p>
              ) : null}
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
