import type { ReactNode } from "react";

import { SiteFooter } from "@/components/public/site-footer";
import { SiteHeader } from "@/components/public/site-header";
import { resolveClinicContent } from "@/lib/clinic-content";
import { getConfiguracionClinica } from "@/services/public.service";

export default async function PublicLayout({ children }: { children: ReactNode }) {
  const config = await getConfiguracionClinica().catch(() => null);
  const content = resolveClinicContent(config);

  return (
    <>
      <SiteHeader
        whatsapp={config?.whatsapp ?? "50255550000"}
        clinicName={config?.nombreClinica ?? content.nombreClinica}
        tagline={config?.fraseEncabezado ?? content.fraseEncabezado}
        logoUrl={config?.urlLogo}
      />
      <main>{children}</main>
      <SiteFooter title={content.tituloPie} description={content.descripcionPie} />
    </>
  );
}
