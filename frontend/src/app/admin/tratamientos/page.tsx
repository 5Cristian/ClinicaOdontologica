"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { treatmentSchema, type TratamientoFormValues } from "@/lib/validations";
import { createTratamiento, deleteTratamiento, fetchTratamientos, updateTratamiento } from "@/services/admin.service";
import { Tratamiento } from "@/types/api";

const emptyTratamientoForm: TratamientoFormValues = {
  name: "",
  descripcion: "",
  precioEstimado: "",
  duracionAproximada: ""
};

export default function AdminTratamientosPage() {
  const { token } = useAuth();
  const [treatments, setTratamientos] = useState<Tratamiento[]>([]);
  const [editingTratamiento, setEditingTratamiento] = useState<Tratamiento | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const form = useForm<TratamientoFormValues>({
    resolver: zodResolver(treatmentSchema),
    defaultValues: emptyTratamientoForm
  });

  // Refresca el catálogo visible para administración y sitio público.
  async function loadData() {
    setTratamientos(await fetchTratamientos(token ?? undefined));
  }

  useEffect(() => {
    void loadData();
  }, [token]);

  // Rellena el formulario cuando se selecciona un tratamiento para edición.
  useEffect(() => {
    if (!editingTratamiento) {
      form.reset(emptyTratamientoForm);
      return;
    }

    form.reset({
      name: editingTratamiento.name,
      descripcion: editingTratamiento.descripcion,
      precioEstimado: editingTratamiento.precioEstimado ? String(editingTratamiento.precioEstimado) : "",
      duracionAproximada: editingTratamiento.duracionAproximada ? String(editingTratamiento.duracionAproximada) : ""
    });
  }, [editingTratamiento, form]);

  // Crea o actualiza el tratamiento según el modo actual del formulario.
  async function onSubmit(values: TratamientoFormValues) {
    if (!token) return;

    const payload = {
      name: values.name,
      description: values.descripcion,
      precioEstimado: values.precioEstimado ? Number(values.precioEstimado) : null,
      duracionAproximada: values.duracionAproximada ? Number(values.duracionAproximada) : null
    };

    if (editingTratamiento) {
      await updateTratamiento(token, editingTratamiento.id, payload);
      setFeedback("Tratamiento actualizado correctamente.");
    } else {
      await createTratamiento(token, payload);
      setFeedback("Tratamiento creado correctamente.");
    }

    setEditingTratamiento(null);
    form.reset(emptyTratamientoForm);
    await loadData();
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold text-slate-950">
              {editingTratamiento ? "Editar tratamiento" : "Nuevo tratamiento"}
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Mantén actualizado el catálogo clínico que usan recepción, odontología y el sitio público.
            </p>
          </div>
          {editingTratamiento ? (
            <Button
              variant="secondary"
              onClick={() => {
                setEditingTratamiento(null);
                form.reset(emptyTratamientoForm);
              }}
            >
              Cancelar edición
            </Button>
          ) : null}
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 grid gap-4 md:grid-cols-2">
          <Field error={form.formState.errors.name?.message}>
            <Input {...form.register("name")} placeholder="Nombre" />
          </Field>
          <Field error={form.formState.errors.precioEstimado?.message}>
            <Input {...form.register("precioEstimado")} placeholder="Precio estimado" />
          </Field>
          <Field className="md:col-span-2" error={form.formState.errors.descripcion?.message}>
            <Textarea {...form.register("descripcion")} placeholder="Descripción" />
          </Field>
          <Field error={form.formState.errors.duracionAproximada?.message}>
            <Input {...form.register("duracionAproximada")} placeholder="Duración aproximada en minutos" />
          </Field>
          <div className="md:col-span-2 flex flex-wrap gap-3">
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {editingTratamiento ? "Actualizar tratamiento" : "Guardar tratamiento"}
            </Button>
          </div>
        </form>

        {feedback ? <p className="mt-4 text-sm text-mint-700">{feedback}</p> : null}
      </Card>

      <Card>
        <h2 className="font-heading text-2xl font-bold text-slate-950">Tratamientos</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {treatments.map((treatment) => (
            <div key={treatment.id} className="rounded-2xl border border-slate-200 p-5">
              <p className="font-semibold text-slate-900">{treatment.name}</p>
              <p className="mt-2 text-sm text-slate-600">{treatment.descripcion}</p>
              <div className="mt-3 text-xs text-slate-500">
                <p>Creado: {treatment.creadoEn ? new Date(treatment.creadoEn).toLocaleString() : "N/D"}</p>
                <p>Actualizado: {treatment.actualizadoEn ? new Date(treatment.actualizadoEn).toLocaleString() : "N/D"}</p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="secondary" onClick={() => setEditingTratamiento(treatment)}>
                  Editar
                </Button>
                <Button
                  variant="danger"
                  onClick={async () => {
                    if (!token) return;
                    await deleteTratamiento(token, treatment.id);
                    if (editingTratamiento?.id === treatment.id) {
                      setEditingTratamiento(null);
                      form.reset(emptyTratamientoForm);
                    }
                    await loadData();
                  }}
                >
                  Eliminar
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function Field({
  children,
  error,
  className
}: {
  children: ReactNode;
  error?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      {children}
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
