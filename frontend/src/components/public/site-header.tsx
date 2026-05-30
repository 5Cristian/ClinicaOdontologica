import Link from "next/link";

import { getClinicInitials } from "@/lib/clinic-content";
import { resolveMediaUrl } from "@/lib/media";

type SiteHeaderProps = {
  whatsapp: string;
  clinicName: string;
  tagline: string;
  logoUrl?: string | null;
};

export function SiteHeader({ whatsapp, clinicName, tagline, logoUrl }: SiteHeaderProps) {
  const initials = getClinicInitials(clinicName);

  return (
    <header className="sticky top-0 z-50 border-b border-white/60 bg-white/80 backdrop-blur-xl">
      <div className="container-shell flex h-20 items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          {logoUrl ? (
            <img src={resolveMediaUrl(logoUrl)} alt={clinicName} className="h-11 w-11 rounded-2xl object-cover" />
          ) : (
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-mint-500 text-lg font-bold text-white">
              {initials}
            </div>
          )}
          <div>
            <p className="font-heading text-lg font-bold text-slate-900">{clinicName}</p>
            <p className="text-xs text-slate-500">{tagline}</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 lg:flex">
          <Link href="/">Inicio</Link>
          <Link href="/servicios">Servicios</Link>
          <Link href="/reservar">Reservar cita</Link>
          <Link href="/contacto">Contacto</Link>
          <Link href="/login">Admin</Link>
        </nav>

        <Link href="/reservar" className="hidden rounded-full bg-brand-600 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-700 sm:inline-flex">
          Agendar ahora
        </Link>

        <Link href={`https://wa.me/${whatsapp}`} className="rounded-full bg-mint-500 px-4 py-2 text-sm font-semibold text-white hover:bg-mint-600">
          WhatsApp
        </Link>
      </div>
    </header>
  );
}
