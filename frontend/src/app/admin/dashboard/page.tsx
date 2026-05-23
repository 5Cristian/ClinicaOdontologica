"use client";

import { useEffect, useState } from "react";
import { BellRing, CalendarClock } from "lucide-react";
import { format } from "date-fns";

import { StatsCard } from "@/components/admin/stats-card";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { fetchCitas, fetchPacientes, fetchTratamientos } from "@/services/admin.service";
import { Cita } from "@/types/api";

export default function AdminDashboardPage() {
  const { token } = useAuth();
  const [citas, setCitas] = useState<Cita[]>([]);
  const [patientsCount, setPacientesCount] = useState(0);
  const [treatmentsCount, setTratamientosCount] = useState(0);

  useEffect(() => {
    if (!token) return;
    Promise.all([fetchCitas(token), fetchPacientes(token), fetchTratamientos(token)]).then(([citasData, patientsData, treatmentsData]) => {
      setCitas(citasData);
      setPacientesCount(patientsData.length);
      setTratamientosCount(treatmentsData.length);
    });
  }, [token]);

  const pending = citas.filter((item) => item.estado === "PENDIENTE").length;
  const confirmed = citas.filter((item) => item.estado === "CONFIRMADA").length;
  const today = new Date().toDateString();
  const todayCitas = citas.filter((item) => new Date(item.programadaPara).toDateString() === today);
  const upcoming = citas.filter((item) => new Date(item.programadaPara) > new Date()).slice(0, 8);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-600">Dashboard</p>
        <h1 className="mt-3 font-heading text-4xl font-bold text-slate-950">Resumen operativo de la clínica</h1>
      </div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard title="Pacientes" value={patientsCount} hint="Pacientes registrados" />
        <StatsCard title="Pendientes" value={pending} hint="Citas pendientes de confirmación" />
        <StatsCard title="Confirmadas" value={confirmed} hint="Citas confirmadas activas" />
        <StatsCard title="Tratamientos" value={treatmentsCount} hint="Servicios activos disponibles" />
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        <Card>
          <div className="mb-5 flex items-center gap-3"><CalendarClock className="h-5 w-5 text-brand-600" /><h2 className="font-heading text-2xl font-bold text-slate-950">Citas del día</h2></div>
          <div className="space-y-4">{todayCitas.length ? todayCitas.map((appointment) => <CitaPreview key={appointment.id} appointment={appointment} />) : <p className="text-sm text-slate-600">No hay citas registradas para hoy.</p>}</div>
        </Card>
        <Card>
          <div className="mb-5 flex items-center gap-3"><BellRing className="h-5 w-5 text-brand-600" /><h2 className="font-heading text-2xl font-bold text-slate-950">Próximas citas</h2></div>
          <div className="space-y-4">{upcoming.length ? upcoming.map((appointment) => <CitaPreview key={appointment.id} appointment={appointment} />) : <p className="text-sm text-slate-600">No hay próximas citas.</p>}</div>
        </Card>
      </div>
    </div>
  );
}

function CitaPreview({ appointment }: { appointment: Cita }) {
  return (
    <div className="rounded-2xl border border-slate-200 p-4">
      <p className="font-semibold text-slate-900">{appointment.paciente.nombreCompleto}</p>
      <p className="text-sm text-slate-600">{appointment.tratamiento.name}</p>
      <p className="mt-2 text-sm text-slate-500">{format(new Date(appointment.programadaPara), "yyyy-MM-dd HH:mm")}</p>
    </div>
  );
}
