import { apiRequest } from "@/lib/api";
import {
  Cita,
  EstadoCita,
  AdminUser,
  RegistroAuditoria,
  ConfiguracionClinica,
  RegistroClinico,
  Paciente,
  RecordatorioProviderStatus,
  ReportSummary,
  Tratamiento,
  MensajeConversacionWhatsApp,
  UploadedMedia,
  WhatsappWebStatus
} from "@/types/api";

// Obtiene el listado completo de pacientes para la gestión administrativa.
export async function fetchPacientes(token: string) {
  return (await apiRequest<Paciente[]>("/patients", { token })).data;
}

// Crea un paciente nuevo desde el panel.
export async function createPaciente(token: string, payload: Partial<Paciente>) {
  return (await apiRequest<Paciente>("/patients", { method: "POST", token, body: JSON.stringify(payload) })).data;
}

// Actualiza un paciente existente por id.
export async function updatePaciente(token: string, id: string, payload: Partial<Paciente>) {
  return (await apiRequest<Paciente>(`/patients/${id}`, { method: "PUT", token, body: JSON.stringify(payload) })).data;
}

// Elimina un paciente desde el panel.
export async function deletePaciente(token: string, id: string) {
  return apiRequest(`/patients/${id}`, { method: "DELETE", token });
}

// Obtiene las citas con paciente y tratamiento relacionados.
export async function fetchCitas(token: string) {
  return (await apiRequest<Cita[]>("/citas", { token })).data;
}

// Crea una cita desde recepción o administración.
export async function createCita(token: string, payload: Record<string, unknown>) {
  return (await apiRequest<Cita>("/citas", { method: "POST", token, body: JSON.stringify(payload) })).data;
}

// Actualiza los datos principales de una cita.
export async function updateCita(token: string, id: string, payload: Record<string, unknown>) {
  return (await apiRequest<Cita>(`/citas/${id}`, { method: "PUT", token, body: JSON.stringify(payload) })).data;
}

// Cambia solo el estado operativo de la cita.
export async function updateEstadoCita(token: string, id: string, estado: EstadoCita) {
  return (
    await apiRequest<Cita>(`/citas/${id}/status`, {
      method: "PATCH",
      token,
      body: JSON.stringify({ estado })
    })
  ).data;
}

// Elimina una cita del sistema.
export async function deleteCita(token: string, id: string) {
  return apiRequest(`/citas/${id}`, { method: "DELETE", token });
}

type WhatsappSendResult = {
  whatsappLink?: string;
  proveedorMode?: string;
  reminder?: {
    proveedor?: string;
    estadoEntrega?: string | null;
  };
  skipped?: boolean;
  reason?: string;
};

// Genera el recordatorio de WhatsApp.
export async function sendRecordatorio(token: string, citaId: string) {
  return (
    await apiRequest<WhatsappSendResult>(`/reminders/whatsapp/${citaId}`, {
      method: "POST",
      token
    })
  ).data;
}

// Envía un recordatorio con mensaje manual personalizado.
export async function sendCustomRecordatorio(token: string, citaId: string, mensaje: string) {
  return (
    await apiRequest<WhatsappSendResult>(`/reminders/whatsapp/${citaId}`, {
      method: "POST",
      token,
      body: JSON.stringify({ mensaje })
    })
  ).data;
}

// Obtiene las citas que aún necesitan recordatorio.
export async function fetchPendingRecordatorios(token: string) {
  return (await apiRequest<Cita[]>("/reminders/pending", { token })).data;
}

// Obtiene la bandeja de pacientes que pidieron reprogramar.
export async function fetchRescheduleRequests(token: string) {
  return (await apiRequest<Cita[]>("/reminders/reschedule-requests", { token })).data;
}

// Devuelve el historial de mensajes de WhatsApp de una cita.
export async function fetchCitaConversation(token: string, citaId: string) {
  return (
    await apiRequest<MensajeConversacionWhatsApp[]>(`/reminders/conversation/${citaId}`, {
      token
    })
  ).data;
}

// Indica si WhatsApp está usando proveedor real o enlace manual.
export async function fetchRecordatorioProviderStatus(token: string) {
  return (await apiRequest<RecordatorioProviderStatus>("/reminders/proveedor-status", { token })).data;
}

export async function fetchWhatsappWebStatus(token: string) {
  return (await apiRequest<WhatsappWebStatus>("/reminders/whatsapp-web/status", { token })).data;
}

export async function startWhatsappWeb(token: string) {
  return (
    await apiRequest<WhatsappWebStatus>("/reminders/whatsapp-web/start", {
      method: "POST",
      token,
      body: JSON.stringify({})
    })
  ).data;
}

export async function disconnectWhatsappWeb(token: string) {
  return (
    await apiRequest<WhatsappWebStatus>("/reminders/whatsapp-web/disconnect", {
      method: "POST",
      token,
      body: JSON.stringify({})
    })
  ).data;
}

// Envía una respuesta manual desde el panel al paciente.
export async function enviarRespuestaManual(token: string, citaId: string, mensaje: string) {
  return (
    await apiRequest<WhatsappSendResult>(
      `/reminders/reply/${citaId}`,
      {
        method: "POST",
        token,
        body: JSON.stringify({ mensaje })
      }
    )
  ).data;
}

// Obtiene el catálogo de tratamientos desde la API.
export async function fetchTratamientos(token?: string) {
  return (await apiRequest<Tratamiento[]>("/treatments", { token })).data;
}

// Crea un tratamiento nuevo.
export async function createTratamiento(token: string, payload: Record<string, unknown>) {
  return (
    await apiRequest<Tratamiento>("/treatments", { method: "POST", token, body: JSON.stringify(payload) })
  ).data;
}

// Actualiza un tratamiento existente.
export async function updateTratamiento(token: string, id: string, payload: Record<string, unknown>) {
  return (
    await apiRequest<Tratamiento>(`/treatments/${id}`, { method: "PUT", token, body: JSON.stringify(payload) })
  ).data;
}

// Elimina un tratamiento del catálogo.
export async function deleteTratamiento(token: string, id: string) {
  return apiRequest(`/treatments/${id}`, { method: "DELETE", token });
}

// Lee la configuración pública de la clínica.
export async function fetchConfiguracionClinica(token?: string) {
  return (await apiRequest<ConfiguracionClinica | null>("/clinic-config", { token })).data;
}

// Actualiza la configuración editable de la clínica desde el panel.
export async function updateConfiguracionClinica(token: string, payload: Record<string, unknown>) {
  return (
    await apiRequest<ConfiguracionClinica>("/clinic-config", {
      method: "PUT",
      token,
      body: JSON.stringify(payload)
    })
  ).data;
}

export async function uploadAdminImage(
  token: string,
  payload: { category: "treatments" | "clinic"; fileName: string; mimeType: string; dataBase64: string }
) {
  return (
    await apiRequest<UploadedMedia>("/media/images", {
      method: "POST",
      token,
      body: JSON.stringify(payload)
    })
  ).data;
}

export async function deleteAdminImage(token: string, path: string) {
  return apiRequest("/media/images", {
    method: "DELETE",
    token,
    body: JSON.stringify({ path })
  });
}

// Obtiene el historial clínico completo o filtrado por paciente.
export async function fetchRegistroClinicos(token: string, pacienteId?: string) {
  const suffix = pacienteId ? `?pacienteId=${pacienteId}` : "";
  return (await apiRequest<RegistroClinico[]>(`/clinical-records${suffix}`, { token })).data;
}

// Crea una nueva nota o atención clínica.
export async function createRegistroClinico(token: string, payload: Record<string, unknown>) {
  return (
    await apiRequest<RegistroClinico>("/clinical-records", { method: "POST", token, body: JSON.stringify(payload) })
  ).data;
}

// Actualiza un registro clínico existente.
export async function updateRegistroClinico(token: string, id: string, payload: Record<string, unknown>) {
  return (
    await apiRequest<RegistroClinico>(`/clinical-records/${id}`, {
      method: "PUT",
      token,
      body: JSON.stringify(payload)
    })
  ).data;
}

// Elimina un registro clínico cuando se requiere depuración administrativa.
export async function deleteRegistroClinico(token: string, id: string) {
  return apiRequest(`/clinical-records/${id}`, { method: "DELETE", token });
}

// Devuelve métricas consolidadas para el módulo de reportes.
export async function fetchReportSummary(token: string) {
  return (await apiRequest<ReportSummary>("/reports/summary", { token })).data;
}

// Devuelve eventos de auditoría para seguimiento administrativo.
export async function fetchRegistroAuditorias(
  token: string,
  filters?: { accion?: string; tipoEntidad?: string; limit?: number }
) {
  const params = new URLSearchParams();
  if (filters?.accion) params.set("accion", filters.accion);
  if (filters?.tipoEntidad) params.set("tipoEntidad", filters.tipoEntidad);
  if (filters?.limit) params.set("limit", String(filters.limit));
  const suffix = params.toString() ? `?${params.toString()}` : "";
  return (await apiRequest<RegistroAuditoria[]>(`/audit-logs${suffix}`, { token })).data;
}

export const fetchAuditLogs = fetchRegistroAuditorias;

// Lista usuarios administrativos disponibles para gestión interna.
export async function fetchUsers(token: string) {
  return (await apiRequest<AdminUser[]>("/users", { token })).data;
}

// Crea un usuario nuevo con rol y contraseña inicial.
export async function createUser(token: string, payload: Record<string, unknown>) {
  return (await apiRequest<AdminUser>("/users", { method: "POST", token, body: JSON.stringify(payload) })).data;
}

// Actualiza el perfil administrativo del usuario seleccionado.
export async function updateUser(token: string, id: string, payload: Record<string, unknown>) {
  return (
    await apiRequest<AdminUser>(`/users/${id}`, {
      method: "PUT",
      token,
      body: JSON.stringify(payload)
    })
  ).data;
}

// Elimina un usuario cuando ya no debe acceder al sistema.
export async function deleteUser(token: string, id: string) {
  return apiRequest(`/users/${id}`, { method: "DELETE", token });
}
