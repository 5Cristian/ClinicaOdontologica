import { z } from "zod";

const mediaRefSchema = z
  .string()
  .refine((value) => !value || value.startsWith("/uploads/") || /^https?:\/\//.test(value), "URL invalida");

export const loginSchema = z.object({
  email: z.string().email("Correo invalido"),
  password: z.string().min(8, "Ingrese una contrasena valida")
});

export const appointmentFormSchema = z.object({
  nombreCompleto: z.string().min(3, "Ingrese el nombre completo"),
  telefono: z.string().min(8, "Ingrese un telefono valido"),
  whatsapp: z.string().min(8, "Ingrese un WhatsApp valido"),
  email: z.string().email("Correo invalido").optional().or(z.literal("")),
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
  diagnosis: z.string().min(5, "Ingrese un diagnostico"),
  piezaDental: z.string().optional().or(z.literal("")),
  medicamentos: z.string().optional().or(z.literal("")),
  notas: z.string().optional().or(z.literal("")),
  nextRecommendedCita: z.string().optional().or(z.literal(""))
});

export const clinicConfigSchema = z.object({
  nombreClinica: z.string().min(3, "Ingrese el nombre de la clinica"),
  telefono: z.string().min(8, "Ingrese un telefono valido"),
  whatsapp: z.string().min(8, "Ingrese un WhatsApp valido"),
  direccion: z.string().optional().or(z.literal("")),
  horarioAtencion: z.string().optional().or(z.literal("")),
  urlLogo: mediaRefSchema.optional().or(z.literal("")),
  tituloSitio: z.string().max(160).optional().or(z.literal("")),
  descripcionSitio: z.string().max(255).optional().or(z.literal("")),
  fraseEncabezado: z.string().max(160).optional().or(z.literal("")),
  textoInsigniaHero: z.string().max(120).optional().or(z.literal("")),
  tituloHero: z.string().max(200).optional().or(z.literal("")),
  descripcionHero: z.string().max(500).optional().or(z.literal("")),
  tituloPaginaServicios: z.string().max(200).optional().or(z.literal("")),
  descripcionPaginaServicios: z.string().max(500).optional().or(z.literal("")),
  tituloPaginaReservas: z.string().max(200).optional().or(z.literal("")),
  descripcionPaginaReservas: z.string().max(500).optional().or(z.literal("")),
  tituloPaginaContacto: z.string().max(200).optional().or(z.literal("")),
  descripcionPaginaContacto: z.string().max(500).optional().or(z.literal("")),
  tituloPie: z.string().max(160).optional().or(z.literal("")),
  descripcionPie: z.string().max(255).optional().or(z.literal("")),
  urlFacebook: z.string().url("URL invalida").optional().or(z.literal("")),
  urlInstagram: z.string().url("URL invalida").optional().or(z.literal("")),
  mensajeWhatsappPredeterminado: z.string().max(500).optional().or(z.literal(""))
});

export const adminUserSchema = z.object({
  name: z.string().min(3, "Ingrese el nombre completo"),
  email: z.string().email("Correo invalido"),
  password: z.string().min(8, "La contrasena debe tener al menos 8 caracteres").optional().or(z.literal("")),
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
