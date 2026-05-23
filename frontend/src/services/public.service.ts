import { apiRequest } from "@/lib/api";
import { Cita, CitaAvailability, ConfiguracionClinica, Tratamiento } from "@/types/api";

export async function getTratamientos() {
  const response = await apiRequest<Tratamiento[]>("/treatments");
  return response.data;
}

export async function getConfiguracionClinica() {
  const response = await apiRequest<ConfiguracionClinica | null>("/clinic-config");
  return response.data;
}

export async function getCitaAvailability(date: string, tratamientoId?: string) {
  const params = new URLSearchParams({ date });
  if (tratamientoId) {
    params.set("tratamientoId", tratamientoId);
  }

  const response = await apiRequest<CitaAvailability>(`/citas/availability?${params.toString()}`);
  return response.data;
}

export async function createPublicCita(payload: {
  nombreCompleto: string;
  telefono: string;
  whatsapp: string;
  email?: string;
  tratamientoId: string;
  programadaPara: string;
  motivo: string;
  observaciones?: string;
}) {
  const response = await apiRequest<Cita>("/citas", {
    method: "POST",
    body: JSON.stringify({
      ...payload,
      origen: "PUBLIC_FORM"
    })
  });

  return response;
}
