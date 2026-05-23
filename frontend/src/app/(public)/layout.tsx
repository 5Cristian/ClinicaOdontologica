import type { ReactNode } from "react";

import { SiteFooter } from "@/components/public/site-footer";
import { SiteHeader } from "@/components/public/site-header";
import { getConfiguracionClinica } from "@/services/public.service";

export default async function PublicLayout({ children }: { children: ReactNode }) {
  const config = await getConfiguracionClinica().catch(() => null);

  return (
    <>
      <SiteHeader whatsapp={config?.whatsapp ?? "50255550000"} />
      <main>{children}</main>
      <SiteFooter />
    </>
  );
}
