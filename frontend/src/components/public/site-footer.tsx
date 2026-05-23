import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="container-shell flex flex-col gap-6 py-10 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-heading text-base font-semibold text-slate-900">Sistema Web de Reservación y Gestión de Citas Odontológicas</p>
          <p>Frontend desacoplado que consume el backend vía API REST.</p>
        </div>
        <div className="flex gap-5">
          <Link href="/servicios">Servicios</Link>
          <Link href="/reservar">Reservar cita</Link>
          <Link href="/contacto">Contacto</Link>
        </div>
      </div>
    </footer>
  );
}
