"use client";

import type { ReactNode } from "react";

import { ToastProvider } from "@/components/ui/toast-provider";
import { AuthProvider } from "@/hooks/use-auth";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ToastProvider>{children}</ToastProvider>
    </AuthProvider>
  );
}
