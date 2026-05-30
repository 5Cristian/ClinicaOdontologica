"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { ImageManager } from "@/components/admin/image-manager";
import { RoleGuard } from "@/components/admin/role-guard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast-provider";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { clinicConfigSchema, type ConfiguracionClinicaFormValues } from "@/lib/validations";
import {
  disconnectWhatsappWeb,
  fetchConfiguracionClinica,
  fetchRecordatorioProviderStatus,
  fetchWhatsappWebStatus,
  startWhatsappWeb,
  updateConfiguracionClinica
} from "@/services/admin.service";
import { RecordatorioProviderStatus, WhatsappWebStatus } from "@/types/api";

const emptyConfigForm: ConfiguracionClinicaFormValues = {
  nombreClinica: "",
  telefono: "",
  whatsapp: "",
  direccion: "",
  horarioAtencion: "",
  urlLogo: "",
  tituloSitio: "",
  descripcionSitio: "",
  fraseEncabezado: "",
  textoInsigniaHero: "",
  tituloHero: "",
  descripcionHero: "",
  tituloPaginaServicios: "",
  descripcionPaginaServicios: "",
  tituloPaginaReservas: "",
  descripcionPaginaReservas: "",
  tituloPaginaContacto: "",
  descripcionPaginaContacto: "",
  tituloPie: "",
  descripcionPie: "",
  urlFacebook: "",
  urlInstagram: "",
  mensajeWhatsappPredeterminado: ""
};

export default function AdminConfigPage() {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [proveedorStatus, setProviderStatus] = useState<RecordatorioProviderStatus | null>(null);
  const [whatsappWebStatus, setWhatsappWebStatus] = useState<WhatsappWebStatus | null>(null);
  const [whatsappBusy, setWhatsappBusy] = useState(false);
  const [logoImages, setLogoImages] = useState<string[]>([]);
  const [businessImages, setBusinessImages] = useState<string[]>([]);
  const [persistedLogoImages, setPersistedLogoImages] = useState<string[]>([]);
  const [persistedBusinessImages, setPersistedBusinessImages] = useState<string[]>([]);
  const form = useForm<ConfiguracionClinicaFormValues>({
    resolver: zodResolver(clinicConfigSchema),
    defaultValues: emptyConfigForm
  });

  useEffect(() => {
    if (!token) return;

    fetchConfiguracionClinica(token)
      .then((config) => {
        if (!config) return;

        setPersistedLogoImages(config.urlLogo ? [config.urlLogo] : []);
        setPersistedBusinessImages(config.imagenesNegocio ?? []);
        setLogoImages(config.urlLogo ? [config.urlLogo] : []);
        setBusinessImages(config.imagenesNegocio ?? []);
        form.reset({
          nombreClinica: config.nombreClinica,
          telefono: config.telefono,
          whatsapp: config.whatsapp,
          direccion: config.direccion ?? "",
          horarioAtencion: config.horarioAtencion ?? "",
          urlLogo: config.urlLogo ?? "",
          tituloSitio: config.tituloSitio ?? "",
          descripcionSitio: config.descripcionSitio ?? "",
          fraseEncabezado: config.fraseEncabezado ?? "",
          textoInsigniaHero: config.textoInsigniaHero ?? "",
          tituloHero: config.tituloHero ?? "",
          descripcionHero: config.descripcionHero ?? "",
          tituloPaginaServicios: config.tituloPaginaServicios ?? "",
          descripcionPaginaServicios: config.descripcionPaginaServicios ?? "",
          tituloPaginaReservas: config.tituloPaginaReservas ?? "",
          descripcionPaginaReservas: config.descripcionPaginaReservas ?? "",
          tituloPaginaContacto: config.tituloPaginaContacto ?? "",
          descripcionPaginaContacto: config.descripcionPaginaContacto ?? "",
          tituloPie: config.tituloPie ?? "",
          descripcionPie: config.descripcionPie ?? "",
          urlFacebook: config.urlFacebook ?? "",
          urlInstagram: config.urlInstagram ?? "",
          mensajeWhatsappPredeterminado: config.mensajeWhatsappPredeterminado ?? ""
        });
      })
      .catch((error) => {
        showToast(error instanceof Error ? error.message : "No se pudo cargar la configuracion.", "error");
      });

    fetchRecordatorioProviderStatus(token).then((status) => {
      setProviderStatus(status);
      setWhatsappWebStatus(status.whatsappWeb ?? null);
    });
    fetchWhatsappWebStatus(token).then(setWhatsappWebStatus);
  }, [token, form, showToast]);

  async function refreshWhatsappStatus() {
    if (!token) return;
    const [providerStatus, webStatus] = await Promise.all([
      fetchRecordatorioProviderStatus(token),
      fetchWhatsappWebStatus(token)
    ]);
    setProviderStatus(providerStatus);
    setWhatsappWebStatus(webStatus);
  }

  async function handleStartWhatsappWeb() {
    if (!token) return;
    setWhatsappBusy(true);
    try {
      const status = await startWhatsappWeb(token);
      setWhatsappWebStatus(status);
      await refreshWhatsappStatus();
      showToast("Conexion de WhatsApp Web iniciada. Escanee el QR si aparece.", "success");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "No se pudo iniciar WhatsApp Web.", "error");
    } finally {
      setWhatsappBusy(false);
    }
  }

  async function handleDisconnectWhatsappWeb() {
    if (!token) return;
    setWhatsappBusy(true);
    try {
      const status = await disconnectWhatsappWeb(token);
      setWhatsappWebStatus(status);
      await refreshWhatsappStatus();
      showToast("WhatsApp Web desconectado correctamente.", "success");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "No se pudo desconectar WhatsApp Web.", "error");
    } finally {
      setWhatsappBusy(false);
    }
  }

  async function onSubmit(values: ConfiguracionClinicaFormValues) {
    if (!token) return;

    try {
      await updateConfiguracionClinica(token, {
        nombreClinica: values.nombreClinica,
        telefono: values.telefono,
        whatsapp: values.whatsapp,
        direccion: values.direccion || null,
        horarioAtencion: values.horarioAtencion || null,
        urlLogo: logoImages[0] || values.urlLogo || null,
        imagenesNegocio: businessImages,
        tituloSitio: values.tituloSitio || null,
        descripcionSitio: values.descripcionSitio || null,
        fraseEncabezado: values.fraseEncabezado || null,
        textoInsigniaHero: values.textoInsigniaHero || null,
        tituloHero: values.tituloHero || null,
        descripcionHero: values.descripcionHero || null,
        tituloPaginaServicios: values.tituloPaginaServicios || null,
        descripcionPaginaServicios: values.descripcionPaginaServicios || null,
        tituloPaginaReservas: values.tituloPaginaReservas || null,
        descripcionPaginaReservas: values.descripcionPaginaReservas || null,
        tituloPaginaContacto: values.tituloPaginaContacto || null,
        descripcionPaginaContacto: values.descripcionPaginaContacto || null,
        tituloPie: values.tituloPie || null,
        descripcionPie: values.descripcionPie || null,
        urlFacebook: values.urlFacebook || null,
        urlInstagram: values.urlInstagram || null,
        mensajeWhatsappPredeterminado: values.mensajeWhatsappPredeterminado || null
      });

      setPersistedLogoImages(logoImages.slice(0, 1));
      setPersistedBusinessImages(businessImages);
      form.setValue("urlLogo", logoImages[0] ?? "");
      setFeedback("Configuracion actualizada correctamente.");
      showToast("Configuracion actualizada correctamente.", "success");
    } catch (error) {
      setFeedback(null);
      showToast(error instanceof Error ? error.message : "No se pudo guardar la configuracion.", "error");
    }
  }

  return (
    <RoleGuard roles={["ADMINISTRADOR"]}>
      <div className="space-y-6">
        <Card>
          <h1 className="font-heading text-3xl font-bold text-slate-950">Configuracion de clinica</h1>
          <p className="mt-2 text-sm text-slate-600">
            Edita la identidad visual, textos de las paginas y galerias del negocio desde un solo panel.
          </p>

          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-8">
            <section className="grid gap-4 md:grid-cols-2">
              <Input {...form.register("nombreClinica")} placeholder="Nombre de la clinica" />
              <Input {...form.register("tituloSitio")} placeholder="Titulo general del sitio" />
              <Input {...form.register("telefono")} placeholder="Telefono" />
              <Input {...form.register("whatsapp")} placeholder="WhatsApp" />
              <Input {...form.register("horarioAtencion")} placeholder="Horario de atencion" />
              <Input {...form.register("fraseEncabezado")} placeholder="Frase corta de marca" />
              <div className="md:col-span-2">
                <Input {...form.register("direccion")} placeholder="Direccion" />
              </div>
              <div className="md:col-span-2">
                <Textarea {...form.register("descripcionSitio")} placeholder="Descripcion general del sitio" />
              </div>
            </section>

            <section className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <ImageManager
                  token={token}
                  category="clinic"
                  images={logoImages}
                  protectedImages={persistedLogoImages}
                  onChange={(nextImages) => {
                    const limited = nextImages.slice(-1);
                    setLogoImages(limited);
                    form.setValue("urlLogo", limited[0] ?? "");
                  }}
                  maxImages={1}
                  title="Logo visual"
                  helperText="Puedes subir el logo o pegar un enlace directo a una imagen."
                />
              </div>
              <div className="md:col-span-2">
                <ImageManager
                  token={token}
                  category="clinic"
                  images={businessImages}
                  protectedImages={persistedBusinessImages}
                  onChange={setBusinessImages}
                  maxImages={12}
                  title="Galeria del negocio"
                  helperText="Acepta archivos subidos o enlaces directos a imagenes del local, equipo o marca."
                />
              </div>
            </section>

            <section className="grid gap-4 md:grid-cols-2">
              <Input {...form.register("textoInsigniaHero")} placeholder="Texto de insignia del hero" />
              <Input {...form.register("tituloHero")} placeholder="Titulo principal del hero" />
              <div className="md:col-span-2">
                <Textarea {...form.register("descripcionHero")} placeholder="Descripcion del hero" />
              </div>
            </section>

            <section className="grid gap-4 md:grid-cols-2">
              <Input {...form.register("tituloPaginaServicios")} placeholder="Titulo pagina servicios" />
              <Input {...form.register("tituloPaginaReservas")} placeholder="Titulo pagina reservas" />
              <div className="md:col-span-2">
                <Textarea {...form.register("descripcionPaginaServicios")} placeholder="Descripcion pagina servicios" />
              </div>
              <div className="md:col-span-2">
                <Textarea {...form.register("descripcionPaginaReservas")} placeholder="Descripcion pagina reservas" />
              </div>
              <Input {...form.register("tituloPaginaContacto")} placeholder="Titulo pagina contacto" />
              <Input {...form.register("tituloPie")} placeholder="Titulo del pie de pagina" />
              <div className="md:col-span-2">
                <Textarea {...form.register("descripcionPaginaContacto")} placeholder="Descripcion pagina contacto" />
              </div>
              <div className="md:col-span-2">
                <Textarea {...form.register("descripcionPie")} placeholder="Descripcion del pie de pagina" />
              </div>
            </section>

            <section className="grid gap-4 md:grid-cols-2">
              <Input {...form.register("urlFacebook")} placeholder="URL de Facebook" />
              <Input {...form.register("urlInstagram")} placeholder="URL de Instagram" />
              <div className="md:col-span-2">
                <Textarea
                  {...form.register("mensajeWhatsappPredeterminado")}
                  placeholder="Mensaje predeterminado de WhatsApp"
                />
              </div>
            </section>

            <div>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                Guardar configuracion
              </Button>
            </div>
          </form>

          {feedback ? <p className="mt-4 text-sm text-mint-700">{feedback}</p> : null}
        </Card>

        <Card>
          <h2 className="font-heading text-2xl font-bold text-slate-950">WhatsApp transaccional</h2>
          <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_260px]">
            <div className="space-y-3 text-sm text-slate-600">
              <p>
                Proveedor configurado: <strong>{proveedorStatus?.proveedor ?? "MANUAL"}</strong>
              </p>
              <p>
                Modo activo:{" "}
                <strong>
                  {proveedorStatus?.mode === "REAL"
                    ? "Twilio activo"
                    : proveedorStatus?.mode === "WHATSAPP_WEB_READY"
                      ? "WhatsApp Web conectado"
                      : "Fallback manual con wa.me"}
                </strong>
              </p>
              <p>
                Estado WhatsApp Web: <strong>{whatsappWebStatus?.state ?? "disabled"}</strong>
              </p>
              <p>
                Sesion local: <strong>{whatsappWebStatus?.sessionPath ?? ".wwebjs_auth"}</strong>
              </p>
              {whatsappWebStatus?.lastError ? (
                <p className="rounded-2xl bg-red-50 px-4 py-3 text-red-700">{whatsappWebStatus.lastError}</p>
              ) : null}
              <div className="flex flex-wrap gap-3 pt-2">
                <Button type="button" onClick={handleStartWhatsappWeb} disabled={whatsappBusy}>
                  {whatsappBusy ? "Procesando..." : "Iniciar WhatsApp Web"}
                </Button>
                <Button type="button" variant="secondary" onClick={refreshWhatsappStatus} disabled={whatsappBusy}>
                  Actualizar estado
                </Button>
                <Button type="button" variant="secondary" onClick={handleDisconnectWhatsappWeb} disabled={whatsappBusy}>
                  Desconectar
                </Button>
              </div>
              <p>
                Este canal se usa solo para mensajes transaccionales: confirmacion de citas aceptadas y recordatorio
                automatico un dia antes.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
              {whatsappWebStatus?.qrDataUrl ? (
                <img src={whatsappWebStatus.qrDataUrl} alt="QR de WhatsApp Web" className="mx-auto h-52 w-52" />
              ) : (
                <div className="flex h-52 items-center justify-center rounded-xl bg-white text-sm text-slate-500">
                  Sin QR disponible
                </div>
              )}
              <p className="mt-3 text-xs text-slate-500">
                Escanee el QR con WhatsApp desde Dispositivos vinculados.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </RoleGuard>
  );
}
