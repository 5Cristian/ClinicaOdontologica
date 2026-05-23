import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Correo inválido"),
  password: z.string().min(8, "Ingrese una contraseña válida")
});

export const appointmentFormSchema = z.object({
  nombreCompleto: z.string().min(3, "Ingrese el nombre completo"),
  telefono: z.string().min(8, "Ingrese un teléfono válido"),
  whatsapp: z.string().min(8, "Ingrese un WhatsApp válido"),
  email: z.string().email("Correo inválido").optional().or(z.literal("")),
  tratamientoId: z.string().min(1, "Seleccione un tratamiento"),
  programadaParaDate: z.string().min(1, "Seleccione una fecha"),
  programadaParaTime: z.string().min(1, "Seleccione una hora"),
  motivo: z.string().min(10, "Describa brevemente el motivo de consulta"),
  observaciones: z.string().max(500).optional().or(z.literal(""))
});

export const patientSchema = z.object({
  nombreCompleto: z.string().min(3),
  telefono: z.string().min(8),
  whatsapp: z.string().min(8),
  email: z.string().email().optional().or(z.literal("")),
  dpi: z.string().optional().or(z.literal("")),
  direccion: z.string().optional().or(z.literal("")),
  alergias: z.string().optional().or(z.literal("")),
  observaciones: z.string().optional().or(z.literal(""))
});

export const treatmentSchema = z.object({
  name: z.string().min(3),
  descripcion: z.string().min(10),
  precioEstimado: z.string().optional().or(z.literal("")),
  duracionAproximada: z.string().optional().or(z.literal(""))
});

export const adminCitaSchema = z.object({
  pacienteId: z.string().min(1, "Seleccione un paciente"),
  tratamientoId: z.string().min(1, "Seleccione un tratamiento"),
  programadaParaDate: z.string().min(1, "Seleccione una fecha"),
  programadaParaTime: z.string().min(1, "Seleccione una hora"),
  motivo: z.string().min(10, "Ingrese un motivo de consulta"),
  observaciones: z.string().optional().or(z.literal(""))
});

export const clinicalRecordSchema = z.object({
  pacienteId: z.string().min(1, "Seleccione un paciente"),
  tratamientoId: z.string().optional().or(z.literal("")),
  diagnosis: z.string().min(5, "Ingrese un diagnóstico"),
  piezaDental: z.string().optional().or(z.literal("")),
  medicamentos: z.string().optional().or(z.literal("")),
  notas: z.string().optional().or(z.literal("")),
  nextRecommendedCita: z.string().optional().or(z.literal(""))
});

export const clinicConfigSchema = z.object({
  nombreClinica: z.string().min(3, "Ingrese el nombre de la clínica"),
  telefono: z.string().min(8, "Ingrese un teléfono válido"),
  whatsapp: z.string().min(8, "Ingrese un WhatsApp válido"),
  direccion: z.string().optional().or(z.literal("")),
  horarioAtencion: z.string().optional().or(z.literal("")),
  urlLogo: z.string().url("URL inválida").optional().or(z.literal("")),
  urlFacebook: z.string().url("URL inválida").optional().or(z.literal("")),
  urlInstagram: z.string().url("URL inválida").optional().or(z.literal("")),
  mensajeWhatsappPredeterminado: z.string().optional().or(z.literal(""))
});

export const adminUserSchema = z.object({
  name: z.string().min(3, "Ingrese el nombre completo"),
  email: z.string().email("Correo inválido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres").optional().or(z.literal("")),
  role: z.enum(["ADMINISTRADOR", "RECEPCION", "ODONTOLOGO"]),
  activo: z.boolean()
});

export type LoginValues = z.infer<typeof loginSchema>;
export type CitaFormValues = z.infer<typeof appointmentFormSchema>;
export type PacienteFormValues = z.infer<typeof patientSchema>;
export type TratamientoFormValues = z.infer<typeof treatmentSchema>;
export type AdminCitaFormValues = z.infer<typeof adminCitaSchema>;
export type RegistroClinicoFormValues = z.infer<typeof clinicalRecordSchema>;
export type ConfiguracionClinicaFormValues = z.infer<typeof clinicConfigSchema>;
export type AdminUserFormValues = z.infer<typeof adminUserSchema>;
