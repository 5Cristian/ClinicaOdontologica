"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { appointmentFormSchema, type CitaFormValues } from "@/lib/validations";
import { formatPhone } from "@/lib/utils";
import { createPublicCita, getCitaAvailability } from "@/services/public.service";
import { CitaAvailability } from "@/types/api";

const PUBLIC_SLOT_TIMES = ["08:00", "09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00"];

function getTodayInputValue() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function CitaForm({ treatments }: { treatments: Array<{ id: string; name: string }> }) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [availability, setAvailability] = useState<CitaAvailability | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotFeedback, setSlotFeedback] = useState<string | null>(null);

  const form = useForm<CitaFormValues>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      nombreCompleto: "",
      telefono: "",
      whatsapp: "",
      email: "",
      tratamientoId: "",
      programadaParaDate: "",
      programadaParaTime: "",
      motivo: "",
      observaciones: ""
    }
  });

  const selectedDate = form.watch("programadaParaDate");
  const selectedTratamientoId = form.watch("tratamientoId");
  const selectedTime = form.watch("programadaParaTime");

  useEffect(() => {
    async function loadAvailability() {
      if (!selectedDate) {
        setAvailability(null);
        setSlotFeedback(null);
        form.setValue("programadaParaTime", "");
        return;
      }

      setLoadingSlots(true);
      setSlotFeedback(null);

      try {
        const data = await getCitaAvailability(selectedDate, selectedTratamientoId || undefined);
        setAvailability(data);

        const currentTime = form.getValues("programadaParaTime");
        if (currentTime && !data.availableSlots.includes(currentTime)) {
          form.setValue("programadaParaTime", "");
          setSlotFeedback("La hora seleccionada ya no está disponible. Seleccione otra hora disponible.");
        }
      } catch (availabilityError) {
        setAvailability(null);
        setError(
          availabilityError instanceof Error
            ? availabilityError.message
            : "No se pudo cargar la disponibilidad de horarios."
        );
      } finally {
        setLoadingSlots(false);
      }
    }

    void loadAvailability();
  }, [selectedDate, selectedTratamientoId, form]);

  function handleSlotSelection(time: string) {
    if (!availability) {
      return;
    }

    if (availability.occupiedSlots.includes(time)) {
      form.setValue("programadaParaTime", "", { shouldValidate: true });
      setSlotFeedback("Hora no disponible. Seleccione otra hora disponible.");
      return;
    }

    if (!availability.availableSlots.includes(time)) {
      form.setValue("programadaParaTime", "", { shouldValidate: true });
      setSlotFeedback("Seleccione una hora disponible en color celeste.");
      return;
    }

    form.setValue("programadaParaTime", time, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true
    });
    setSlotFeedback(null);
    setError(null);
  }

  async function onSubmit(values: CitaFormValues) {
    setError(null);
    setSuccess(null);
    setSlotFeedback(null);

    try {
      await createPublicCita({
        nombreCompleto: values.nombreCompleto,
        telefono: formatPhone(values.telefono),
        whatsapp: formatPhone(values.whatsapp),
        email: values.email || undefined,
        tratamientoId: values.tratamientoId,
        programadaPara: `${values.programadaParaDate}T${values.programadaParaTime}:00-06:00`,
        motivo: values.motivo,
        observaciones: values.observaciones || undefined
      });

      setSuccess("Su solicitud fue registrada correctamente. La clínica confirmará la cita pronto.");
      form.reset();
      setAvailability(null);
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "No se pudo registrar la cita.");
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Nombre completo" error={form.formState.errors.nombreCompleto?.message}>
          <Input {...form.register("nombreCompleto")} />
        </Field>
        <Field label="Teléfono" error={form.formState.errors.telefono?.message}>
          <Input {...form.register("telefono")} />
        </Field>
        <Field label="WhatsApp" error={form.formState.errors.whatsapp?.message}>
          <Input {...form.register("whatsapp")} />
        </Field>
        <Field label="Correo electrónico" error={form.formState.errors.email?.message}>
          <Input {...form.register("email")} />
        </Field>
        <Field label="Fecha deseada" error={form.formState.errors.programadaParaDate?.message}>
          <Input {...form.register("programadaParaDate")} type="date" min={getTodayInputValue()} />
        </Field>
        <Field label="Tratamiento" error={form.formState.errors.tratamientoId?.message}>
          <Select {...form.register("tratamientoId")}>
            <option value="">Seleccione un tratamiento</option>
            {treatments.map((treatment) => (
              <option key={treatment.id} value={treatment.id}>
                {treatment.name}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Field label="Hora deseada" error={form.formState.errors.programadaParaTime?.message}>
        <input type="hidden" {...form.register("programadaParaTime")} />
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
            {PUBLIC_SLOT_TIMES.map((time) => {
              const isAvailable = availability?.availableSlots.includes(time) ?? false;
              const isOccupied = availability?.occupiedSlots.includes(time) ?? false;
              const isSelected = selectedTime === time;

              let stateClass = "bg-slate-100 text-slate-400";
              if (isSelected) {
                stateClass = "bg-sky-600 text-white shadow-sm";
              } else if (isOccupied) {
                stateClass = "bg-slate-200 text-slate-500";
              } else if (isAvailable) {
                stateClass = "bg-sky-100 text-sky-800 ring-1 ring-sky-200 hover:bg-sky-200";
              }

              return (
                <button
                  key={time}
                  type="button"
                  onClick={() => handleSlotSelection(time)}
                  disabled={!selectedDate || loadingSlots}
                  className={`rounded-2xl px-3 py-3 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-sky-300 disabled:cursor-not-allowed disabled:opacity-70 ${stateClass}`}
                >
                  {time}
                </button>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-3 text-xs font-medium">
            <span className="rounded-full bg-sky-100 px-3 py-1 text-sky-800">Disponible</span>
            <span className="rounded-full bg-slate-200 px-3 py-1 text-slate-600">No disponible</span>
          </div>
          {!selectedDate ? (
            <p className="text-sm text-slate-500">Seleccione primero una fecha para consultar los horarios.</p>
          ) : loadingSlots ? (
            <p className="text-sm text-slate-500">Cargando disponibilidad de horarios.</p>
          ) : slotFeedback ? (
            <p className="text-sm text-amber-700">{slotFeedback}</p>
          ) : selectedTime ? (
            <p className="text-sm text-sky-700">Hora seleccionada: {selectedTime}</p>
          ) : (
            <p className="text-sm text-slate-500">Las horas en gris no están disponibles. Seleccione una hora en color celeste.</p>
          )}
        </div>
      </Field>

      <Field label="Motivo de consulta" error={form.formState.errors.motivo?.message}>
        <Textarea {...form.register("motivo")} />
      </Field>

      <Field label="Observaciones" error={form.formState.errors.observaciones?.message}>
        <Textarea {...form.register("observaciones")} />
      </Field>

      {error ? <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
      {success ? <div className="rounded-2xl bg-mint-50 px-4 py-3 text-sm text-mint-700">{success}</div> : null}
      {selectedDate && !loadingSlots && !availability?.availableSlots.length ? (
        <div className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
          No hay horarios disponibles para la fecha seleccionada. Pruebe otro día.
        </div>
      ) : null}

      <Button type="submit" className="w-full md:w-auto" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? "Enviando..." : "Solicitar cita"}
      </Button>
    </form>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      {children}
      {error ? <span className="text-sm text-red-600">{error}</span> : null}
    </label>
  );
}
