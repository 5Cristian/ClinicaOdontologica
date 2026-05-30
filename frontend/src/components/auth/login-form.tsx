"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { loginSchema, type LoginValues } from "@/lib/validations";

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  async function onSubmit(values: LoginValues) {
    setError(null);
    try {
      await login(values.email, values.password);
      router.push("/admin/dashboard");
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "No se pudo iniciar sesión.");
    }
  }

  return (
    <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
      <label className="block space-y-2">
        <span className="text-sm font-semibold text-slate-700">Correo electrónico</span>
        <Input {...form.register("email")} type="email" />
      </label>
      <label className="block space-y-2">
        <span className="text-sm font-semibold text-slate-700">Contraseña</span>
        <Input {...form.register("password")} type="password" />
      </label>
      {error ? <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
      <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? "Ingresando..." : "Ingresar al panel"}
      </Button>
    </form>
  );
}
