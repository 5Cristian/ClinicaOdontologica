"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { ImageManager } from "@/components/admin/image-manager";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast-provider";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { resolveMediaUrl } from "@/lib/media";
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
  const [treatmentImages, setTreatmentImages] = useState<string[]>([]);
  const [persistedTreatmentImages, setPersistedTreatmentImages] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const { showToast } = useToast();
  const form = useForm<TratamientoFormValues>({
    resolver: zodResolver(treatmentSchema),
    defaultValues: emptyTratamientoForm
  });

  async function loadData() {
    try {
      setTratamientos(await fetchTratamientos(token ?? undefined));
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudieron cargar los tratamientos.";
      showToast(message, "error");
    }
  }

  useEffect(() => {
    void loadData();
  }, [token]);

  useEffect(() => {
    if (!editingTratamiento) {
      setPersistedTreatmentImages([]);
      setTreatmentImages([]);
      form.reset(emptyTratamientoForm);
      return;
    }

    setPersistedTreatmentImages(editingTratamiento.imagenes ?? []);
    setTreatmentImages(editingTratamiento.imagenes ?? []);
    form.reset({
      name: editingTratamiento.name,
      descripcion: editingTratamiento.descripcion,
      precioEstimado: editingTratamiento.precioEstimado ? String(editingTratamiento.precioEstimado) : "",
      duracionAproximada: editingTratamiento.duracionAproximada ? String(editingTratamiento.duracionAproximada) : ""
    });
  }, [editingTratamiento, form]);

  async function onSubmit(values: TratamientoFormValues) {
    if (!token) return;

    const payload = {
      name: values.name,
      description: values.descripcion,
      imagenes: treatmentImages,
      precioEstimado: values.precioEstimado ? Number(values.precioEstimado) : null,
      duracionAproximada: values.duracionAproximada ? Number(values.duracionAproximada) : null
    };

    try {
      if (editingTratamiento) {
        await updateTratamiento(token, editingTratamiento.id, payload);
        setFeedback("Tratamiento actualizado correctamente.");
        showToast("Tratamiento actualizado correctamente.", "success");
      } else {
        await createTratamiento(token, payload);
        setFeedback("Tratamiento creado correctamente.");
        showToast("Tratamiento creado correctamente.", "success");
      }

      setEditingTratamiento(null);
      setPersistedTreatmentImages([]);
      setTreatmentImages([]);
      form.reset(emptyTratamientoForm);
      await loadData();
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo guardar el tratamiento.";
      setFeedback(null);
      showToast(message, "error");
    }
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
              Mantiene actualizado el catalogo clinico que usan recepcion, odontologia y el sitio publico.
            </p>
          </div>
          {editingTratamiento ? (
            <Button
              variant="secondary"
              onClick={() => {
                setEditingTratamiento(null);
                setPersistedTreatmentImages([]);
                setTreatmentImages([]);
                form.reset(emptyTratamientoForm);
              }}
            >
              Cancelar edicion
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
            <Textarea {...form.register("descripcion")} placeholder="Descripcion" />
          </Field>
          <Field error={form.formState.errors.duracionAproximada?.message}>
            <Input {...form.register("duracionAproximada")} placeholder="Duracion aproximada en minutos" />
          </Field>
          <div className="md:col-span-2">
            <ImageManager
              token={token}
              category="treatments"
              images={treatmentImages}
              protectedImages={persistedTreatmentImages}
              onChange={setTreatmentImages}
              maxImages={12}
              title="Galeria del tratamiento"
              helperText="Sube fotos del procedimiento, resultados referenciales o imagenes explicativas."
            />
          </div>
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
              {treatment.imagenes?.[0] ? (
                <img
                  src={resolveMediaUrl(treatment.imagenes[0])}
                  alt={treatment.name}
                  className="mb-4 h-40 w-full rounded-2xl object-cover"
                />
              ) : null}
              <p className="font-semibold text-slate-900">{treatment.name}</p>
              <p className="mt-2 text-sm text-slate-600">{treatment.descripcion}</p>
              <p className="mt-2 text-xs text-slate-500">{treatment.imagenes?.length ?? 0} imagenes vinculadas</p>
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
                    try {
                      await deleteTratamiento(token, treatment.id);
                      showToast("Tratamiento eliminado correctamente.", "success");
                      if (editingTratamiento?.id === treatment.id) {
                        setEditingTratamiento(null);
                        setPersistedTreatmentImages([]);
                        setTreatmentImages([]);
                        form.reset(emptyTratamientoForm);
                      }
                      await loadData();
                    } catch (error) {
                      const message = error instanceof Error ? error.message : "No se pudo eliminar el tratamiento.";
                      showToast(message, "error");
                    }
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
