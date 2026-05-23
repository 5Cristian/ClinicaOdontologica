"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { RoleGuard } from "@/components/admin/role-guard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { clinicConfigSchema, type ConfiguracionClinicaFormValues } from "@/lib/validations";
import { fetchConfiguracionClinica, fetchRecordatorioProviderStatus, updateConfiguracionClinica } from "@/services/admin.service";
import { RecordatorioProviderStatus } from "@/types/api";

const emptyConfigForm: ConfiguracionClinicaFormValues = {
  nombreClinica: "",
  telefono: "",
  whatsapp: "",
  direccion: "",
  horarioAtencion: "",
  urlLogo: "",
  urlFacebook: "",
  urlInstagram: "",
  mensajeWhatsappPredeterminado: ""
};

export default function AdminConfigPage() {
  const { token } = useAuth();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [proveedorStatus, setProviderStatus] = useState<RecordatorioProviderStatus | null>(null);
  const form = useForm<ConfiguracionClinicaFormValues>({
    resolver: zodResolver(clinicConfigSchema),
    defaultValues: emptyConfigForm
  });

  useEffect(() => {
    if (!token) return;

    // Carga la configuración persistida de la clínica para edición administrativa.
    fetchConfiguracionClinica(token).then((config) => {
      if (!config) return;

      form.reset({
        nombreClinica: config.nombreClinica,
        telefono: config.telefono,
        whatsapp: config.whatsapp,
        direccion: config.direccion ?? "",
        horarioAtencion: config.horarioAtencion ?? "",
        urlLogo: config.urlLogo ?? "",
        urlFacebook: config.urlFacebook ?? "",
        urlInstagram: config.urlInstagram ?? "",
        mensajeWhatsappPredeterminado: config.mensajeWhatsappPredeterminado ?? ""
      });
    });

    fetchRecordatorioProviderStatus(token).then(setProviderStatus);
  }, [token, form]);

  // Guarda datos públicos y operativos usados por landing, contacto y recordatorios.
  async function onSubmit(values: ConfiguracionClinicaFormValues) {
    if (!token) return;

    await updateConfiguracionClinica(token, {
      nombreClinica: values.nombreClinica,
      telefono: values.telefono,
      whatsapp: values.whatsapp,
      direccion: values.direccion || null,
      horarioAtencion: values.horarioAtencion || null,
      urlLogo: values.urlLogo || null,
      urlFacebook: values.urlFacebook || null,
      urlInstagram: values.urlInstagram || null,
      mensajeWhatsappPredeterminado: values.mensajeWhatsappPredeterminado || null
    });

    setFeedback("Configuración actualizada correctamente.");
  }

  return (
    <RoleGuard roles={["ADMINISTRADOR"]}>
      <div className="space-y-6">
        <Card>
          <h1 className="font-heading text-3xl font-bold text-slate-950">Configuración de clínica</h1>
          <p className="mt-2 text-sm text-slate-600">
            Centraliza identidad, contacto, horario y mensaje base de WhatsApp.
          </p>

          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 grid gap-4 md:grid-cols-2">
            <Input {...form.register("nombreClinica")} placeholder="Nombre de la clínica" />
            <Input {...form.register("telefono")} placeholder="Teléfono" />
            <Input {...form.register("whatsapp")} placeholder="WhatsApp" />
            <Input {...form.register("horarioAtencion")} placeholder="Horario de atención" />
            <div className="md:col-span-2">
              <Input {...form.register("direccion")} placeholder="Dirección" />
            </div>
            <Input {...form.register("urlLogo")} placeholder="URL del logo" />
            <Input {...form.register("urlFacebook")} placeholder="URL de Facebook" />
            <Input {...form.register("urlInstagram")} placeholder="URL de Instagram" />
            <div className="md:col-span-2">
              <Textarea
                {...form.register("mensajeWhatsappPredeterminado")}
                placeholder="Mensaje predeterminado de WhatsApp"
              />
            </div>
            <div className="md:col-span-2">
              <Button type="submit" disabled={form.formState.isSubmitting}>
                Guardar configuración
              </Button>
            </div>
          </form>

          {feedback ? <p className="mt-4 text-sm text-mint-700">{feedback}</p> : null}
        </Card>

        <Card>
          <h2 className="font-heading text-2xl font-bold text-slate-950">Preparación para WhatsApp Business API</h2>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <p>
              Estado actual del proveedor:{" "}
              <strong>{proveedorStatus?.mode === "REAL" ? "Twilio activo" : "Fallback manual con wa.me"}</strong>
            </p>
            <p>Proveedor configurado: <strong>{proveedorStatus?.proveedor ?? "MANUAL"}</strong></p>
            <p>Credenciales Twilio completas: <strong>{proveedorStatus?.twilioConfigured ? "Sí" : "No"}</strong></p>
            <p>Esta fase deja el sistema listo para reemplazar el enlace `wa.me` por una integración real con proveedor externo.</p>
            <p>Recomendación: manejar credenciales de proveedor solo en backend, registrar plantillas aprobadas y almacenar logs de envío por mensaje.</p>
            <p>Antes de integrar: definir proveedor, webhook de confirmación, control de errores por reintento y plantillas por tipo de recordatorio.</p>
          </div>
        </Card>
      </div>
    </RoleGuard>
  );
}
