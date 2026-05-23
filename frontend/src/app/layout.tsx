import type { Metadata } from "next";
import { DM_Sans, Plus_Jakarta_Sans } from "next/font/google";
import type { ReactNode } from "react";

import "@/app/globals.css";
import { Providers } from "@/components/providers";

const headingFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta"
});

const bodyFont = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans"
});

export const metadata: Metadata = {
  title: "Clínica Odontológica",
  description: "Frontend de la clínica odontológica desacoplado del backend."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" className={`${headingFont.variable} ${bodyFont.variable}`}>
      <body className="font-[var(--font-dm-sans)]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
