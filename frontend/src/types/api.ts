export type ApiSuccess<T> = {
  success: true;
  mensaje: string;
  data: T;
};

export type ApiError = {
  success: false;
  mensaje: string;
  errors: Array<{ path?: string; mensaje?: string }>;
};

export type RolUsuario = "ADMINISTRADOR" | "RECEPCION" | "ODONTOLOGO";

export type UsuarioAutenticado = {
  id: string;
  name: string;
  email: string;
  role: RolUsuario;
};

export type Tratamiento = {
  id: string;
  name: string;
  slug: string;
  descripcion: string;
  imagenes: string[];
  precioEstimado?: string | null;
  duracionAproximada?: number | null;
  activo?: boolean;
  creadoPor?: string | null;
  actualizadoPor?: string | null;
  creadoEn?: string;
  actualizadoEn?: string;
};

export type Paciente = {
  id: string;
  nombreCompleto: string;
  dpi?: string | null;
  fechaNacimiento?: string | null;
  age?: number | null;
  telefono: string;
  whatsapp: string;
  email?: string | null;
  direccion?: string | null;
  historialMedico?: string | null;
  alergias?: string | null;
  observaciones?: string | null;
  creadoPor?: string | null;
  actualizadoPor?: string | null;
  creadoEn?: string;
  actualizadoEn?: string;
};

export type EstadoCita = "PENDIENTE" | "CONFIRMADA" | "CANCELADA" | "ATENDIDA" | "NO_ASISTIO";

export type Cita = {
  id: string;
  pacienteId: string;
  tratamientoId: string;
  programadaPara: string;
  estado: EstadoCita;
  motivo: string;
  observaciones?: string | null;
  origen: string;
  recordatorioEnviado: boolean;
  recordatorioEnviadoEn?: string | null;
  confirmacionWhatsappEnviada?: boolean;
  confirmacionWhatsappEnviadaEn?: string | null;
  recordatorioUnDiaEnviado?: boolean;
  recordatorioUnDiaEnviadoEn?: string | null;
  ultimoErrorWhatsapp?: string | null;
  creadoPor?: string | null;
  actualizadoPor?: string | null;
  recordatorio?: {
    id: string;
    proveedor?: string;
    estadoEntrega?: string | null;
    intencionRespuestaPaciente?: string | null;
    ultimoMensajeEntrante?: string | null;
    recibidoEn?: string | null;
    sidMensajeProveedor?: string | null;
    ultimaRespuestaManual?: string | null;
    ultimaRespuestaManualEn?: string | null;
  } | null;
  paciente: Paciente;
  tratamiento: Tratamiento;
  creadoEn: string;
  actualizadoEn: string;
};

export type ConfiguracionClinica = {
  nombreClinica: string;
  telefono: string;
  whatsapp: string;
  direccion?: string | null;
  horarioAtencion?: string | null;
  urlLogo?: string | null;
  imagenesNegocio: string[];
  tituloSitio?: string | null;
  descripcionSitio?: string | null;
  fraseEncabezado?: string | null;
  textoInsigniaHero?: string | null;
  tituloHero?: string | null;
  descripcionHero?: string | null;
  tituloPaginaServicios?: string | null;
  descripcionPaginaServicios?: string | null;
  tituloPaginaReservas?: string | null;
  descripcionPaginaReservas?: string | null;
  tituloPaginaContacto?: string | null;
  descripcionPaginaContacto?: string | null;
  tituloPie?: string | null;
  descripcionPie?: string | null;
  urlFacebook?: string | null;
  urlInstagram?: string | null;
  mensajeWhatsappPredeterminado?: string | null;
};

export type RegistroClinico = {
  id: string;
  pacienteId: string;
  tratamientoId?: string | null;
  diagnosis: string;
  piezaDental?: string | null;
  medicamentos?: string | null;
  notas?: string | null;
  nextRecommendedCita?: string | null;
  atendidoEn: string;
  paciente: Paciente;
  tratamiento?: Tratamiento | null;
  creadoEn: string;
  actualizadoEn: string;
};

export type ReportSummary = {
  todayCitas: number;
  monthCitas: number;
  newPacientesThisMonth: number;
  cancelledCitas: number;
  noShowCitas: number;
  estimatedRevenue: number;
  totalPacientes: number;
  totalTratamientos: number;
  estadoBreakdown: {
    pending: number;
    confirmed: number;
    cancelled: number;
    attended: number;
    noShow: number;
  };
  topTratamientos: Array<{
    name: string;
    total: number;
  }>;
};

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: RolUsuario;
  activo: boolean;
  creadoEn: string;
  actualizadoEn: string;
};

export type RecordatorioProviderStatus = {
  proveedor: "MANUAL" | "TWILIO" | "WHATSAPP_WEB";
  twilioConfigured: boolean;
  mode: "REAL" | "FALLBACK_MANUAL" | "WHATSAPP_WEB_READY";
  whatsappWeb?: WhatsappWebStatus;
};

export type WhatsappWebStatus = {
  providerEnabled: boolean;
  autoStart: boolean;
  state: "disabled" | "disconnected" | "initializing" | "qr" | "ready" | "auth_failure";
  ready: boolean;
  hasQr: boolean;
  qr?: string | null;
  qrDataUrl?: string | null;
  lastError?: string | null;
  sessionPath: string;
};

export type MensajeConversacionWhatsApp = {
  id: string;
  citaId: string;
  direction: "OUTBOUND" | "INBOUND" | string;
  cuerpoMensaje: string;
  proveedor?: string | null;
  sidMensajeProveedor?: string | null;
  estadoEntrega?: string | null;
  intencionDetectada?: string | null;
  enviadoPorUsuarioId?: string | null;
  creadoEn: string;
};

export type RegistroAuditoria = {
  id: string;
  accion: string;
  tipoEntidad: string;
  entidadId?: string | null;
  descripcion: string;
  metadatos?: Record<string, unknown> | null;
  creadoEn: string;
  usuarioActor?: {
    id: string;
    name: string;
    email: string;
    role: RolUsuario;
  } | null;
};

export type CitaAvailability = {
  date: string;
  tratamientoId?: string | null;
  duracionAproximada?: number | null;
  occupiedSlots: string[];
  availableSlots: string[];
};

export type UploadedMedia = {
  path: string;
  url: string;
};
