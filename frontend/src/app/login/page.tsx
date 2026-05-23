import { Card } from "@/components/ui/card";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(24,149,205,0.16),_transparent_30%),linear-gradient(180deg,_#f8fbff_0%,_#eef7fb_100%)] p-6">
      <Card className="w-full max-w-md">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-600">Acceso administrativo</p>
        <h1 className="mt-3 font-heading text-3xl font-bold text-slate-950">Iniciar sesión en la clínica</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">Credenciales iniciales del seed: <strong>admin@clinica.com</strong> / <strong>Admin12345*</strong></p>
        <div className="mt-6"><LoginForm /></div>
      </Card>
    </main>
  );
}
