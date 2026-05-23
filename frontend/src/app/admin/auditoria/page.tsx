"use client";

import { useEffect, useState } from "react";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { fetchRegistroAuditorias } from "@/services/admin.service";
import { RegistroAuditoria } from "@/types/api";

const entityOptions = ["", "PATIENT", "APPOINTMENT", "TREATMENT", "CLINICAL_RECORD", "USER", "AUTH"] as const;
const actionOptions = [
  "",
  "AUTH_LOGIN",
  "AUTH_LOGOUT",
  "AUTH_REGISTER",
  "PATIENT_CREATE",
  "PATIENT_UPDATE",
  "PATIENT_DELETE",
  "APPOINTMENT_CREATE",
  "APPOINTMENT_UPDATE",
  "APPOINTMENT_STATUS_UPDATE",
  "APPOINTMENT_DELETE",
  "TREATMENT_CREATE",
  "TREATMENT_UPDATE",
  "TREATMENT_DELETE",
  "CLINICAL_RECORD_CREATE",
  "CLINICAL_RECORD_UPDATE",
  "CLINICAL_RECORD_DELETE",
  "USER_CREATE",
  "USER_UPDATE",
  "USER_DELETE"
] as const;

export default function AdminAuditPage() {
  const { token } = useAuth();
  const [logs, setLogs] = useState<RegistroAuditoria[]>([]);
  const [action, setAction] = useState("");
  const [entityType, setEntityType] = useState("");
  const [limit, setLimit] = useState("100");

  async function loadLogs() {
    if (!token) return;
    const data = await fetchRegistroAuditorias(token, {
      accion: action || undefined,
      tipoEntidad: entityType || undefined,
      limit: Number(limit) || 100
    });
    setLogs(data);
  }

  useEffect(() => {
    void loadLogs();
  }, [token, action, entityType, limit]);

  return (
    <div className="space-y-6">
      <Card>
        <h1 className="font-heading text-3xl font-bold text-slate-950">Auditoría del sistema</h1>
        <p className="mt-2 text-sm text-slate-600">
          Revisa quién hizo cada cambio sensible en usuarios, pacientes, citas y sesiones.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Select value={entityType} onChange={(event) => setEntityType(event.target.value)}>
            {entityOptions.map((option) => (
              <option key={option || "all-entities"} value={option}>
                {option || "Todas las entidades"}
              </option>
            ))}
          </Select>
          <Select value={action} onChange={(event) => setAction(event.target.value)}>
            {actionOptions.map((option) => (
              <option key={option || "all-actions"} value={option}>
                {option || "Todas las acciones"}
              </option>
            ))}
          </Select>
          <Input value={limit} onChange={(event) => setLimit(event.target.value)} type="number" min={1} max={500} />
        </div>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-slate-500">
              <tr>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Usuario</th>
                <th className="px-4 py-3">Acción</th>
                <th className="px-4 py-3">Entidad</th>
                <th className="px-4 py-3">Descripción</th>
                <th className="px-4 py-3">Referencia</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-slate-100">
                  <td className="px-4 py-4 text-xs text-slate-500">{new Date(log.creadoEn).toLocaleString()}</td>
                  <td className="px-4 py-4">
                    <p className="font-medium text-slate-900">{log.usuarioActor?.name ?? "Sistema"}</p>
                    <p className="text-xs text-slate-500">{log.usuarioActor?.email ?? "-"}</p>
                  </td>
                  <td className="px-4 py-4 text-xs font-semibold text-brand-700">{log.accion}</td>
                  <td className="px-4 py-4">{log.tipoEntidad}</td>
                  <td className="px-4 py-4 text-slate-600">{log.descripcion}</td>
                  <td className="px-4 py-4 text-xs text-slate-500">{log.entidadId ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!logs.length ? <p className="mt-4 text-sm text-slate-600">No hay eventos para los filtros actuales.</p> : null}
      </Card>
    </div>
  );
}
