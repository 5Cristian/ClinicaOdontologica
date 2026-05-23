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
import { patientSchema, type PacienteFormValues } from "@/lib/validations";
import { createPaciente, deletePaciente, fetchPacientes, updatePaciente } from "@/services/admin.service";
import { Paciente } from "@/types/api";

const emptyPacienteForm: PacienteFormValues = {
  nombreCompleto: "",
  telefono: "",
  whatsapp: "",
  email: "",
  dpi: "",
  direccion: "",
  alergias: "",
  observaciones: ""
};

export default function AdminPacientesPage() {
  const { token } = useAuth();
  const [patients, setPacientes] = useState<Paciente[]>([]);
  const [editingPaciente, setEditingPaciente] = useState<Paciente | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const form = useForm<PacienteFormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: emptyPacienteForm
  });

  // Carga la lista actual de pacientes desde la API del backend.
  async function loadData() {
    if (!token) return;
    setPacientes(await fetchPacientes(token));
  }

  useEffect(() => {
    void loadData();
  }, [token]);

  // Sincroniza el formulario con el paciente seleccionado para edición.
  useEffect(() => {
    if (!editingPaciente) {
      form.reset(emptyPacienteForm);
      return;
    }

    form.reset({
      nombreCompleto: editingPaciente.nombreCompleto,
      telefono: editingPaciente.telefono,
      whatsapp: editingPaciente.whatsapp,
      email: editingPaciente.email ?? "",
      dpi: editingPaciente.dpi ?? "",
      direccion: editingPaciente.direccion ?? "",
      alergias: editingPaciente.alergias ?? "",
      observaciones: editingPaciente.observaciones ?? ""
    });
  }, [editingPaciente, form]);

  // Guarda o actualiza pacientes usando el mismo formulario administrativo.
  async function onSubmit(values: PacienteFormValues) {
    if (!token) return;

    const payload = {
      nombreCompleto: values.nombreCompleto,
      telefono: values.telefono,
      whatsapp: values.whatsapp,
      email: values.email || null,
      dpi: values.dpi || null,
      direccion: values.direccion || null,
      alergias: values.alergias || null,
      observaciones: values.observaciones || null
    };

    if (editingPaciente) {
      await updatePaciente(token, editingPaciente.id, payload);
      setFeedback("Paciente actualizado correctamente.");
    } else {
      await createPaciente(token, payload);
      setFeedback("Paciente creado correctamente.");
    }

    setEditingPaciente(null);
    form.reset(emptyPacienteForm);
    await loadData();
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold text-slate-950">
              {editingPaciente ? "Editar paciente" : "Nuevo paciente"}
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Registra o actualiza la información de contacto básica del paciente.
            </p>
          </div>
          {editingPaciente ? (
            <Button
              variant="secondary"
              onClick={() => {
                setEditingPaciente(null);
                form.reset(emptyPacienteForm);
              }}
            >
              Cancelar edición
            </Button>
          ) : null}
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 grid gap-4 md:grid-cols-2">
          <Field error={form.formState.errors.nombreCompleto?.message}>
            <Input {...form.register("nombreCompleto")} placeholder="Nombre completo" />
          </Field>
          <Field error={form.formState.errors.telefono?.message}>
            <Input {...form.register("telefono")} placeholder="Teléfono" />
          </Field>
          <Field error={form.formState.errors.whatsapp?.message}>
            <Input {...form.register("whatsapp")} placeholder="WhatsApp" />
          </Field>
          <Field error={form.formState.errors.email?.message}>
            <Input {...form.register("email")} placeholder="Correo" />
          </Field>
          <Field error={form.formState.errors.dpi?.message}>
            <Input {...form.register("dpi")} placeholder="DPI" />
          </Field>
          <Field error={form.formState.errors.direccion?.message}>
            <Input {...form.register("direccion")} placeholder="Dirección" />
          </Field>
          <Field className="md:col-span-2" error={form.formState.errors.alergias?.message}>
            <Textarea {...form.register("alergias")} placeholder="Alergias" />
          </Field>
          <Field className="md:col-span-2" error={form.formState.errors.observaciones?.message}>
            <Textarea {...form.register("observaciones")} placeholder="Observaciones" />
          </Field>
          <div className="md:col-span-2 flex flex-wrap gap-3">
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {editingPaciente ? "Actualizar paciente" : "Guardar paciente"}
            </Button>
          </div>
        </form>

        {feedback ? <p className="mt-4 text-sm text-mint-700">{feedback}</p> : null}
      </Card>

      <Card>
        <h2 className="font-heading text-2xl font-bold text-slate-950">Pacientes</h2>
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-slate-500">
              <tr>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Teléfono</th>
                <th className="px-4 py-3">WhatsApp</th>
                <th className="px-4 py-3">Correo</th>
                <th className="px-4 py-3">Auditoría</th>
                <th className="px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((patient) => (
                <tr key={patient.id} className="border-b border-slate-100">
                  <td className="px-4 py-4">{patient.nombreCompleto}</td>
                  <td className="px-4 py-4">{patient.telefono}</td>
                  <td className="px-4 py-4">{patient.whatsapp}</td>
                  <td className="px-4 py-4">{patient.email ?? "Sin correo"}</td>
                  <td className="px-4 py-4 text-xs text-slate-500">
                    <p>Creado: {patient.creadoEn ? new Date(patient.creadoEn).toLocaleString() : "N/D"}</p>
                    <p>Actualizado: {patient.actualizadoEn ? new Date(patient.actualizadoEn).toLocaleString() : "N/D"}</p>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      <Button variant="secondary" onClick={() => setEditingPaciente(patient)}>
                        Editar
                      </Button>
                      <Button
                        variant="danger"
                        onClick={async () => {
                          if (!token) return;
                          await deletePaciente(token, patient.id);
                          if (editingPaciente?.id === patient.id) {
                            setEditingPaciente(null);
                            form.reset(emptyPacienteForm);
                          }
                          await loadData();
                        }}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
