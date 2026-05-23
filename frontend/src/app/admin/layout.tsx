import type { ReactNode } from "react";

import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AuthGuard } from "@/components/admin/auth-guard";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-100">
      <div className="container-shell grid gap-6 py-6 lg:grid-cols-[280px_1fr]">
        <AuthGuard>
          <AdminSidebar />
          <div>{children}</div>
        </AuthGuard>
      </div>
    </div>
  );
}
