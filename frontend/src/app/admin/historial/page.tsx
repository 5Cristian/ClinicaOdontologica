"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { clinicalRecordSchema, type RegistroClinicoFormValues } from "@/lib/validations";
import {
  createRegistroClinico,
  deleteRegistroClinico,
  fetchRegistroClinicos,
  fetchPacientes,
  fetchTratamientos,
  updateRegistroClinico
} from "@/services/admin.service";
import { RegistroClinico, Paciente, Tratamiento } from "@/types/api";

const emptyRegistroClinicoForm: RegistroClinicoFormValues = {
  pacienteId: "",
  tratamientoId: "",
  diagnosis: "",
  piezaDental: "",
  medicamentos: "",
  notas: "",
  nextRecommendedCita: ""
};

export default function AdminClinicalHistoryPage() {
  const { token } = useAuth();
  const [records, setRecords] = useState<RegistroClinico[]>([]);
  const [patients, setPacientes] = useState<Paciente[]>([]);
  const [treatments, setTratamientos] = useState<Tratamiento[]>([]);
  const [selectedPacienteId, setSelectedPacienteId] = useState<string>("");
  const [editingRecord, setEditingRecord] = useState<RegistroClinico | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const form = useForm<RegistroClinicoFormValues>({
    resolver: zodResolver(clinicalRecordSchema),
    defaultValues: emptyRegistroClinicoForm
  });

  // Carga pacientes, tratamientos y registros para la operación clínica diaria.
  async function loadData(pacienteId?: string) {
    if (!token) return;

    const [recordsData, patientsData, treatmentsData] = await Promise.all([
      fetchRegistroClinicos(token, pacienteId),
      fetchPacientes(token),
      fetchTratamientos(token)
    ]);

    setRecords(recordsData);
    setPacientes(patientsData);
    setTratamientos(treatmentsData);
  }

  useEffect(() => {
    void loadData(selectedPacienteId || undefined);
  }, [token, selectedPacienteId]);

  // Pasa un registro existente al formulario para edición.
  useEffect(() => {
    if (!editingRecord) {
      form.reset(emptyRegistroClinicoForm);
      return;
    }

    form.reset({
      pacienteId: editingRecord.pacienteId,
      tratamientoId: editingRecord.tratamientoId ?? "",
      diagnosis: editingRecord.diagnosis,
      piezaDental: editingRecord.piezaDental ?? "",
      medicamentos: editingRecord.medicamentos ?? "",
      notas: editingRecord.notas ?? "",
      nextRecommendedCita: editingRecord.nextRecommendedCita
        ? editingRecord.nextRecommendedCita.slice(0, 10)
        : ""
    });
  }, [editingRecord, form]);

  // Guarda o actualiza observaciones clínicas del paciente.
  async function onSubmit(values: RegistroClinicoFormValues) {
    if (!token) return;

    const payload = {
      pacienteId: values.pacienteId,
      tratamientoId: values.tratamientoId || null,
      diagnosis: values.diagnosis,
      piezaDental: values.piezaDental || null,
      medicamentos: values.medicamentos || null,
      notas: values.notas || null,
      nextRecommendedCita: values.nextRecommendedCita
        ? `${values.nextRecommendedCita}T00:00:00.000Z`
        : null
    };

    if (editingRecord) {
      await updateRegistroClinico(token, editingRecord.id, payload);
      setFeedback("Registro clínico actualizado correctamente.");
    } else {
      await createRegistroClinico(token, payload);
      setFeedback("Registro clínico creado correctamente.");
    }

    setEditingRecord(null);
    form.reset(emptyRegistroClinicoForm);
    await loadData(selectedPacienteId || undefined);
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold text-slate-950">
              {editingRecord ? "Editar historial clínico" : "Nuevo historial clínico"}
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Registra diagnóstico, tratamiento y seguimiento recomendado del paciente.
            </p>
          </div>
          {editingRecord ? (
            <Button
              variant="secondary"
              onClick={() => {
                setEditingRecord(null);
                form.reset(emptyRegistroClinicoForm);
              }}
            >
              Cancelar edición
            </Button>
          ) : null}
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 grid gap-4 md:grid-cols-2">
          <Field error={form.formState.errors.pacienteId?.message}>
            <Select {...form.register("pacienteId")}>
              <option value="">Seleccione un paciente</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.nombreCompleto}
                </option>
              ))}
            </Select>
          </Field>
          <Field error={form.formState.errors.tratamientoId?.message}>
            <Select {...form.register("tratamientoId")}>
              <option value="">Tratamiento relacionado</option>
              {treatments.map((treatment) => (
                <option key={treatment.id} value={treatment.id}>
                  {treatment.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field className="md:col-span-2" error={form.formState.errors.diagnosis?.message}>
            <Textarea {...form.register("diagnosis")} placeholder="Diagnóstico" />
          </Field>
          <Field error={form.formState.errors.piezaDental?.message}>
            <Input {...form.register("piezaDental")} placeholder="Pieza dental" />
          </Field>
          <Field error={form.formState.errors.nextRecommendedCita?.message}>
            <Input {...form.register("nextRecommendedCita")} type="date" />
          </Field>
          <Field className="md:col-span-2" error={form.formState.errors.medicamentos?.message}>
            <Textarea {...form.register("medicamentos")} placeholder="Medicamentos indicados" />
          </Field>
          <Field className="md:col-span-2" error={form.formState.errors.notas?.message}>
            <Textarea {...form.register("notas")} placeholder="Observaciones del odontólogo" />
          </Field>
          <div className="md:col-span-2">
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {editingRecord ? "Actualizar historial" : "Guardar historial"}
            </Button>
          </div>
        </form>

        {feedback ? <p className="mt-4 text-sm text-mint-700">{feedback}</p> : null}
      </Card>

      <Card>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-heading text-2xl font-bold text-slate-950">Historial clínico registrado</h2>
            <p className="text-sm text-slate-600">Filtra por paciente para revisar seguimiento y evolución.</p>
          </div>
          <div className="w-full md:w-80">
            <Select value={selectedPacienteId} onChange={(event) => setSelectedPacienteId(event.target.value)}>
              <option value="">Todos los pacientes</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.nombreCompleto}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {records.map((record) => (
            <div key={record.id} className="rounded-2xl border border-slate-200 p-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="font-semibold text-slate-900">{record.paciente.nombreCompleto}</p>
                  <p className="text-sm text-slate-600">{record.tratamiento?.name ?? "Sin tratamiento asociado"}</p>
                  <p className="mt-2 text-sm text-slate-500">
                    Atención: {new Date(record.atendidoEn).toLocaleString()}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="secondary" onClick={() => setEditingRecord(record)}>
                    Editar
                  </Button>
                  <Button
                    variant="danger"
                    onClick={async () => {
                      if (!token) return;
                      await deleteRegistroClinico(token, record.id);
                      if (editingRecord?.id === record.id) {
                        setEditingRecord(null);
                        form.reset(emptyRegistroClinicoForm);
                      }
                      await loadData(selectedPacienteId || undefined);
                    }}
                  >
                    Eliminar
                  </Button>
                </div>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <Info label="Diagnóstico" value={record.diagnosis} />
                <Info label="Pieza dental" value={record.piezaDental ?? "No especificada"} />
                <Info label="Medicamentos" value={record.medicamentos ?? "Sin medicamentos"} />
                <Info
                  label="Próxima cita recomendada"
                  value={
                    record.nextRecommendedCita
                      ? new Date(record.nextRecommendedCita).toLocaleDateString()
                      : "Sin recomendación"
                  }
                />
                <div className="md:col-span-2">
                  <Info label="Observaciones" value={record.notas ?? "Sin observaciones"} />
                </div>
              </div>
            </div>
          ))}

          {!records.length ? <p className="text-sm text-slate-600">No hay registros clínicos para el filtro actual.</p> : null}
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

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-sm text-slate-800">{value}</p>
    </div>
  );
}
