"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  addDays,
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subDays,
  subMonths
} from "date-fns";
import { es } from "date-fns/locale";
import { Fragment, type ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { adminCitaSchema, type AdminCitaFormValues } from "@/lib/validations";
import {
  createCita,
  deleteCita,
  fetchCitaConversation,
  fetchCitas,
  fetchPacientes,
  fetchPendingRecordatorios,
  fetchRecordatorioProviderStatus,
  fetchRescheduleRequests,
  fetchTratamientos,
  enviarRespuestaManual,
  sendCustomRecordatorio,
  sendRecordatorio,
  updateCita,
  updateEstadoCita
} from "@/services/admin.service";
import {
  Cita,
  EstadoCita,
  Paciente,
  RecordatorioProviderStatus,
  Tratamiento,
  MensajeConversacionWhatsApp
} from "@/types/api";

const statuses: EstadoCita[] = ["PENDIENTE", "CONFIRMADA", "CANCELADA", "ATENDIDA", "NO_ASISTIO"];
const calendarModes = ["day", "week", "month"] as const;
type CalendarMode = (typeof calendarModes)[number];

const emptyCitaForm: AdminCitaFormValues = {
  pacienteId: "",
  tratamientoId: "",
  programadaParaDate: "",
  programadaParaTime: "",
  motivo: "",
  observaciones: ""
};

export default function AdminCitasPage() {
  const { token } = useAuth();
  const [citas, setCitas] = useState<Cita[]>([]);
  const [patients, setPacientes] = useState<Paciente[]>([]);
  const [treatments, setTratamientos] = useState<Tratamiento[]>([]);
  const [pendingRecordatorios, setPendingRecordatorios] = useState<Cita[]>([]);
  const [rescheduleRequests, setRescheduleRequests] = useState<Cita[]>([]);
  const [proveedorStatus, setProviderStatus] = useState<RecordatorioProviderStatus | null>(null);
  const [conversationByCita, setConversationByCita] = useState<
    Record<string, MensajeConversacionWhatsApp[]>
  >({});
  const [openConversationId, setOpenConversationId] = useState<string | null>(null);
  const [editingCita, setEditingCita] = useState<Cita | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [calendarMode, setCalendarMode] = useState<CalendarMode>("month");
  const [focusDate, setFocusDate] = useState<Date>(new Date());
  const [customMessages, setCustomMessages] = useState<Record<string, string>>({});
  const [replyMessages, setReplyMessages] = useState<Record<string, string>>({});
  const form = useForm<AdminCitaFormValues>({
    resolver: zodResolver(adminCitaSchema),
    defaultValues: emptyCitaForm
  });

  // Carga agenda, catálogos y recordatorios pendientes desde la API.
  async function loadData() {
    if (!token) return;

    const [citasData, patientsData, treatmentsData, remindersData, rescheduleData, proveedorData] =
      await Promise.all([
        fetchCitas(token),
        fetchPacientes(token),
        fetchTratamientos(token),
        fetchPendingRecordatorios(token),
        fetchRescheduleRequests(token),
        fetchRecordatorioProviderStatus(token)
      ]);

    setCitas(citasData);
    setPacientes(patientsData);
    setTratamientos(treatmentsData);
    setPendingRecordatorios(remindersData);
    setRescheduleRequests(rescheduleData);
    setProviderStatus(proveedorData);
  }

  useEffect(() => {
    void loadData();
  }, [token]);

  // Rellena el formulario con los datos de la cita seleccionada.
  useEffect(() => {
    if (!editingCita) {
      form.reset(emptyCitaForm);
      return;
    }

    const scheduledDate = new Date(editingCita.programadaPara);
    form.reset({
      pacienteId: editingCita.pacienteId,
      tratamientoId: editingCita.tratamientoId,
      programadaParaDate: format(scheduledDate, "yyyy-MM-dd"),
      programadaParaTime: format(scheduledDate, "HH:mm"),
      motivo: editingCita.motivo,
      observaciones: editingCita.observaciones ?? ""
    });
  }, [editingCita, form]);

  // Crea o actualiza citas desde el panel administrativo.
  async function onSubmit(values: AdminCitaFormValues) {
    if (!token) return;

    const payload = {
      pacienteId: values.pacienteId,
      tratamientoId: values.tratamientoId,
      programadaPara: `${values.programadaParaDate}T${values.programadaParaTime}:00-06:00`,
      motivo: values.motivo,
      observaciones: values.observaciones || null,
      origen: "ADMINISTRADOR_PANEL"
    };

    if (editingCita) {
      await updateCita(token, editingCita.id, payload);
      setFeedback("Cita actualizada correctamente.");
    } else {
      await createCita(token, payload);
      setFeedback("Cita creada correctamente.");
    }

    setEditingCita(null);
    form.reset(emptyCitaForm);
    await loadData();
  }

  // Cambia el rango visual según el modo actual del calendario.
  const calendarDays = useMemo(() => {
    if (calendarMode === "day") {
      return [startOfDay(focusDate)];
    }

    if (calendarMode === "week") {
      return eachDayOfInterval({
        start: startOfWeek(focusDate, { locale: es }),
        end: endOfWeek(focusDate, { locale: es })
      });
    }

    const monthStart = startOfMonth(focusDate);
    const monthEnd = endOfMonth(focusDate);

    return eachDayOfInterval({
      start: startOfWeek(monthStart, { locale: es }),
      end: endOfWeek(monthEnd, { locale: es })
    });
  }, [calendarMode, focusDate]);

  const visibleCitas = useMemo(() => {
    if (calendarMode === "day") {
      return citas.filter((item) => isSameDay(new Date(item.programadaPara), focusDate));
    }

    if (calendarMode === "week") {
      const weekDays = new Set(calendarDays.map((day) => format(day, "yyyy-MM-dd")));
      return citas.filter((item) => weekDays.has(format(new Date(item.programadaPara), "yyyy-MM-dd")));
    }

    return citas;
  }, [citas, calendarDays, calendarMode, focusDate]);

  function moveRange(direction: "prev" | "next") {
    // Navega el enfoque del calendario según la granularidad actual.
    if (calendarMode === "day") {
      setFocusDate(direction === "prev" ? subDays(focusDate, 1) : addDays(focusDate, 1));
      return;
    }

    if (calendarMode === "week") {
      setFocusDate(direction === "prev" ? subDays(focusDate, 7) : addDays(focusDate, 7));
      return;
    }

    setFocusDate(direction === "prev" ? subMonths(focusDate, 1) : addMonths(focusDate, 1));
  }

  async function toggleConversation(citaId: string) {
    if (!token) return;

    if (openConversationId === citaId) {
      setOpenConversationId(null);
      return;
    }

    if (!conversationByCita[citaId]) {
      const data = await fetchCitaConversation(token, citaId);
      setConversationByCita((current) => ({
        ...current,
        [citaId]: data
      }));
    }

    setOpenConversationId(citaId);
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold text-slate-950">
              {editingCita ? "Editar cita" : "Nueva cita"}
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Administra la agenda desde el panel sin depender del formulario público.
            </p>
          </div>
          {editingCita ? (
            <Button
              variant="secondary"
              onClick={() => {
                setEditingCita(null);
                form.reset(emptyCitaForm);
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
              <option value="">Seleccione un tratamiento</option>
              {treatments.map((treatment) => (
                <option key={treatment.id} value={treatment.id}>
                  {treatment.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field error={form.formState.errors.programadaParaDate?.message}>
            <Input {...form.register("programadaParaDate")} type="date" />
          </Field>
          <Field error={form.formState.errors.programadaParaTime?.message}>
            <Input {...form.register("programadaParaTime")} type="time" />
          </Field>
          <Field className="md:col-span-2" error={form.formState.errors.motivo?.message}>
            <Textarea {...form.register("motivo")} placeholder="Motivo de consulta" />
          </Field>
          <Field className="md:col-span-2" error={form.formState.errors.observaciones?.message}>
            <Textarea {...form.register("observaciones")} placeholder="Observaciones" />
          </Field>
          <div className="md:col-span-2">
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {editingCita ? "Actualizar cita" : "Guardar cita"}
            </Button>
          </div>
        </form>

        {feedback ? <p className="mt-4 text-sm text-mint-700">{feedback}</p> : null}
      </Card>

      <Card>
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-heading text-2xl font-bold text-slate-950">Calendario de citas</h2>
            <p className="text-sm text-slate-600">
              Cambia entre vista diaria, semanal o mensual para revisar la agenda con más contexto.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {calendarModes.map((mode) => (
              <Button
                key={mode}
                variant={calendarMode === mode ? "primary" : "secondary"}
                onClick={() => setCalendarMode(mode)}
              >
                {mode === "day" ? "Día" : mode === "week" ? "Semana" : "Mes"}
              </Button>
            ))}
          </div>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => moveRange("prev")}>
            Anterior
          </Button>
          <Button variant="secondary" onClick={() => setFocusDate(new Date())}>
            Hoy
          </Button>
          <Button variant="secondary" onClick={() => moveRange("next")}>
            Siguiente
          </Button>
        </div>

        <p className="mb-4 font-semibold capitalize text-slate-900">
          {calendarMode === "day" && format(focusDate, "PPP", { locale: es })}
          {calendarMode === "week" &&
            `${format(calendarDays[0], "PPP", { locale: es })} - ${format(
              calendarDays[calendarDays.length - 1],
              "PPP",
              { locale: es }
            )}`}
          {calendarMode === "month" && format(focusDate, "MMMM yyyy", { locale: es })}
        </p>

        {calendarMode === "day" ? (
          <div className="space-y-3">
            {visibleCitas.length ? (
              visibleCitas.map((appointment) => (
                <div key={appointment.id} className="rounded-2xl border border-slate-200 p-4">
                  <p className="font-semibold text-slate-900">
                    {format(new Date(appointment.programadaPara), "HH:mm")} - {appointment.paciente.nombreCompleto}
                  </p>
                  <p className="text-sm text-slate-600">{appointment.tratamiento.name}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-600">No hay citas para el día seleccionado.</p>
            )}
          </div>
        ) : (
          <div className={`grid gap-2 text-xs ${calendarMode === "week" ? "grid-cols-7" : "grid-cols-7"}`}>
            {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((day) => (
              <div key={day} className="rounded-2xl bg-slate-100 px-3 py-2 text-center font-semibold text-slate-600">
                {day}
              </div>
            ))}

            {calendarDays.map((day) => {
              const dayCitas = citas.filter((appointment) =>
                isSameDay(new Date(appointment.programadaPara), day)
              );

              return (
                <div
                  key={day.toISOString()}
                  className={`min-h-32 rounded-2xl border p-3 ${
                    calendarMode === "month" && !isSameMonth(day, focusDate)
                      ? "border-slate-100 bg-slate-50"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <p className="font-semibold text-slate-900">{format(day, "d")}</p>
                  <div className="mt-2 space-y-2">
                    {dayCitas.slice(0, 4).map((appointment) => (
                      <div key={appointment.id} className="rounded-xl bg-brand-50 px-2 py-1 text-[11px] text-brand-800">
                        <p className="font-semibold">{format(new Date(appointment.programadaPara), "HH:mm")}</p>
                        <p className="truncate">{appointment.paciente.nombreCompleto}</p>
                      </div>
                    ))}
                    {dayCitas.length > 4 ? (
                      <p className="text-[11px] text-slate-500">+{dayCitas.length - 4} más</p>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Card>
        <div className="mb-4">
          <h2 className="font-heading text-2xl font-bold text-slate-950">Recordatorios pendientes</h2>
          <p className="text-sm text-slate-600">
            Envía mensajes rápidos o personaliza el texto antes de abrir WhatsApp.
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Modo actual: {proveedorStatus?.mode === "REAL" ? "Twilio WhatsApp en tiempo real" : "Enlace manual wa.me"}
          </p>
        </div>
        <div className="space-y-4">
          {pendingRecordatorios.length ? (
            pendingRecordatorios.map((appointment) => (
              <div key={appointment.id} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">{appointment.paciente.nombreCompleto}</p>
                    <p className="text-sm text-slate-600">
                      {appointment.tratamiento.name} · {format(new Date(appointment.programadaPara), "PPP p", { locale: es })}
                    </p>
                  </div>
                  <Button
                    variant="secondary"
                    onClick={async () => {
                      if (!token) return;
                      const data = await sendRecordatorio(token, appointment.id);
                      window.open(data.whatsappLink, "_blank");
                      await loadData();
                    }}
                  >
                    Envío rápido
                  </Button>
                </div>
                <Textarea
                  className="mt-3"
                  placeholder="Mensaje personalizado para este recordatorio"
                  value={customMessages[appointment.id] ?? ""}
                  onChange={(event) =>
                    setCustomMessages((current) => ({
                      ...current,
                      [appointment.id]: event.target.value
                    }))
                  }
                />
                <div className="mt-3">
                  <Button
                    onClick={async () => {
                      if (!token) return;
                      const mensaje = customMessages[appointment.id]?.trim();
                      const data = mensaje
                        ? await sendCustomRecordatorio(token, appointment.id, mensaje)
                        : await sendRecordatorio(token, appointment.id);
                      window.open(data.whatsappLink, "_blank");
                      await loadData();
                    }}
                  >
                    Enviar con mensaje actual
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-600">No hay recordatorios pendientes por ahora.</p>
          )}
        </div>
      </Card>

      <Card>
        <div className="mb-4">
          <h2 className="font-heading text-2xl font-bold text-slate-950">Solicitudes de reprogramación</h2>
          <p className="text-sm text-slate-600">
            Revisa lo que pidió el paciente y responde desde el panel para coordinar un nuevo horario.
          </p>
        </div>
        <div className="space-y-4">
          {rescheduleRequests.length ? (
            rescheduleRequests.map((appointment) => (
              <div key={appointment.id} className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">{appointment.paciente.nombreCompleto}</p>
                    <p className="text-sm text-slate-600">
                      {appointment.tratamiento.name} · {format(new Date(appointment.programadaPara), "PPP p", { locale: es })}
                    </p>
                    <p className="mt-2 text-sm text-slate-700">
                      Mensaje recibido: {appointment.recordatorio?.ultimoMensajeEntrante ?? "Sin detalle"}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Última respuesta manual:{" "}
                      {appointment.recordatorio?.ultimaRespuestaManualEn
                        ? new Date(appointment.recordatorio.ultimaRespuestaManualEn).toLocaleString()
                        : "No enviada"}
                    </p>
                  </div>
                  <Button
                    variant="secondary"
                    onClick={() =>
                      setReplyMessages((current) => ({
                        ...current,
                        [appointment.id]:
                          current[appointment.id] ||
                          `Hola ${appointment.paciente.nombreCompleto}, con gusto le ayudamos a reprogramar su cita. Indíquenos el horario que prefiere o comuníquese con la clínica.`
                      }))
                    }
                  >
                    Usar respuesta sugerida
                  </Button>
                </div>
                <Textarea
                  className="mt-3"
                  placeholder="Respuesta manual para coordinar la nueva cita"
                  value={replyMessages[appointment.id] ?? ""}
                  onChange={(event) =>
                    setReplyMessages((current) => ({
                      ...current,
                      [appointment.id]: event.target.value
                    }))
                  }
                />
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    onClick={async () => {
                      if (!token) return;
                      const mensaje = replyMessages[appointment.id]?.trim();
                      if (!mensaje) return;
                      const data = await enviarRespuestaManual(token, appointment.id, mensaje);
                      if (data.proveedorMode !== "REAL") {
                        window.open(data.whatsappLink, "_blank");
                      }
                      await loadData();
                    }}
                  >
                    Responder por WhatsApp
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={async () => {
                      if (!token) return;
                      await updateEstadoCita(token, appointment.id, "PENDIENTE");
                      await loadData();
                    }}
                  >
                    Mantener pendiente
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-600">No hay solicitudes de reprogramación pendientes.</p>
          )}
        </div>
      </Card>

      <Card>
        <h2 className="font-heading text-2xl font-bold text-slate-950">Citas registradas</h2>
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-slate-500">
              <tr>
                <th className="px-4 py-3">Paciente</th>
                <th className="px-4 py-3">Tratamiento</th>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Respuesta paciente</th>
                <th className="px-4 py-3">Auditoría</th>
                <th className="px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {citas.map((appointment) => (
                <Fragment key={appointment.id}>
                  <tr key={appointment.id} className="border-b border-slate-100">
                    <td className="px-4 py-4">{appointment.paciente.nombreCompleto}</td>
                    <td className="px-4 py-4">{appointment.tratamiento.name}</td>
                    <td className="px-4 py-4">{format(new Date(appointment.programadaPara), "yyyy-MM-dd HH:mm")}</td>
                    <td className="px-4 py-4">
                      <Select
                        value={appointment.estado}
                        onChange={async (event) => {
                          if (!token) return;
                          await updateEstadoCita(token, appointment.id, event.target.value as EstadoCita);
                          await loadData();
                        }}
                      >
                        {statuses.map((estado) => (
                          <option key={estado} value={estado}>
                            {estado}
                          </option>
                        ))}
                      </Select>
                    </td>
                    <td className="px-4 py-4 text-xs text-slate-500">
                      <p>{appointment.recordatorio?.intencionRespuestaPaciente ?? "Sin respuesta"}</p>
                      <p className="max-w-44 truncate">{appointment.recordatorio?.ultimoMensajeEntrante ?? ""}</p>
                      <p className="max-w-44 truncate">{appointment.recordatorio?.ultimaRespuestaManual ?? ""}</p>
                    </td>
                    <td className="px-4 py-4 text-xs text-slate-500">
                      <p>Creada: {new Date(appointment.creadoEn).toLocaleString()}</p>
                      <p>Actualizada: {new Date(appointment.actualizadoEn).toLocaleString()}</p>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        <Button variant="secondary" onClick={() => setEditingCita(appointment)}>
                          Editar
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={async () => {
                            if (!token) return;
                            const data = await sendRecordatorio(token, appointment.id);
                            window.open(data.whatsappLink, "_blank");
                            await loadData();
                          }}
                        >
                          WhatsApp
                        </Button>
                        <Button variant="secondary" onClick={() => void toggleConversation(appointment.id)}>
                          Conversación
                        </Button>
                        <Button
                          variant="danger"
                          onClick={async () => {
                            if (!token) return;
                            await deleteCita(token, appointment.id);
                            if (editingCita?.id === appointment.id) {
                              setEditingCita(null);
                              form.reset(emptyCitaForm);
                            }
                            await loadData();
                          }}
                        >
                          Eliminar
                        </Button>
                      </div>
                    </td>
                  </tr>
                  {openConversationId === appointment.id ? (
                    <tr key={`${appointment.id}-conversation`} className="border-b border-slate-100 bg-slate-50/70">
                      <td colSpan={7} className="px-4 py-4">
                        <div className="space-y-3">
                          <p className="text-sm font-semibold text-slate-900">Historial de WhatsApp</p>
                          {conversationByCita[appointment.id]?.length ? (
                            conversationByCita[appointment.id].map((mensaje) => (
                              <div
                                key={mensaje.id}
                                className={`rounded-2xl p-3 ${
                                  mensaje.direction === "OUTBOUND"
                                    ? "ml-auto max-w-2xl bg-brand-50 text-brand-950"
                                    : "mr-auto max-w-2xl bg-white text-slate-900"
                                }`}
                              >
                                <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                                  <span>{mensaje.direction === "OUTBOUND" ? "Clínica" : "Paciente"}</span>
                                  <span>{new Date(mensaje.creadoEn).toLocaleString()}</span>
                                  {mensaje.intencionDetectada ? <span>Intento: {mensaje.intencionDetectada}</span> : null}
                                  {mensaje.estadoEntrega ? <span>Estado: {mensaje.estadoEntrega}</span> : null}
                                </div>
                                <p className="mt-2 whitespace-pre-wrap text-sm">{mensaje.cuerpoMensaje}</p>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-slate-600">No hay mensajes registrados para esta cita.</p>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
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
