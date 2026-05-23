"use client";

import { format } from "date-fns";
import { useEffect, useState } from "react";

import { RoleGuard } from "@/components/admin/role-guard";
import { StatsCard } from "@/components/admin/stats-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { fetchReportSummary } from "@/services/admin.service";
import { ReportSummary } from "@/types/api";

export default function AdminReportsPage() {
  const { token } = useAuth();
  const [report, setReport] = useState<ReportSummary | null>(null);

  useEffect(() => {
    if (!token) return;
    fetchReportSummary(token).then(setReport);
  }, [token]);

  function exportCsv() {
    if (!report) return;

    // Convierte el resumen actual en un archivo CSV descargable.
    const rows = [
      ["Indicador", "Valor"],
      ["Citas hoy", String(report.todayCitas)],
      ["Citas mes", String(report.monthCitas)],
      ["Pacientes nuevos del mes", String(report.newPacientesThisMonth)],
      ["Canceladas", String(report.cancelledCitas)],
      ["No asistió", String(report.noShowCitas)],
      ["Ingresos estimados", String(report.estimatedRevenue)],
      ["Total pacientes", String(report.totalPacientes)],
      ["Total tratamientos", String(report.totalTratamientos)],
      ["Pendientes", String(report.estadoBreakdown.pending)],
      ["Confirmadas", String(report.estadoBreakdown.confirmed)],
      ["Atendidas", String(report.estadoBreakdown.attended)]
    ];

    report.topTratamientos.forEach((item, index) => {
      rows.push([`Tratamiento top ${index + 1}`, `${item.name} (${item.total})`]);
    });

    const csv = rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "reporte-clinica.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  async function exportPdf() {
    if (!report) return;

    const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
      import("jspdf"),
      import("jspdf-autotable")
    ]);

    const doc = new jsPDF();
    const generatedAt = format(new Date(), "yyyy-MM-dd HH:mm");

    // Construye un PDF ejecutivo con métricas y tablas legibles para administración.
    doc.setFontSize(18);
    doc.text("Reporte de Clinica Odontologica", 14, 18);
    doc.setFontSize(10);
    doc.text(`Generado: ${generatedAt}`, 14, 26);

    autoTable(doc, {
      startY: 34,
      head: [["Indicador", "Valor"]],
      body: [
        ["Citas hoy", String(report.todayCitas)],
        ["Citas mes", String(report.monthCitas)],
        ["Pacientes nuevos del mes", String(report.newPacientesThisMonth)],
        ["Canceladas", String(report.cancelledCitas)],
        ["No asistio", String(report.noShowCitas)],
        ["Ingresos estimados", `$${report.estimatedRevenue.toFixed(2)}`],
        ["Total pacientes", String(report.totalPacientes)],
        ["Total tratamientos", String(report.totalTratamientos)],
        ["Pendientes", String(report.estadoBreakdown.pending)],
        ["Confirmadas", String(report.estadoBreakdown.confirmed)],
        ["Canceladas (estado)", String(report.estadoBreakdown.cancelled)],
        ["Atendidas", String(report.estadoBreakdown.attended)],
        ["No asistio (estado)", String(report.estadoBreakdown.noShow)]
      ],
      theme: "grid",
      headStyles: { fillColor: [20, 121, 184] }
    });

    const finalY = (doc as typeof doc & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? 120;

    autoTable(doc, {
      startY: finalY + 12,
      head: [["Tratamiento", "Total de citas"]],
      body: report.topTratamientos.length
        ? report.topTratamientos.map((item) => [item.name, String(item.total)])
        : [["Sin datos suficientes", "0"]],
      theme: "grid",
      headStyles: { fillColor: [28, 163, 132] }
    });

    doc.save(`reporte-clinica-${format(new Date(), "yyyyMMdd-HHmm")}.pdf`);
  }

  return (
    <RoleGuard roles={["ADMINISTRADOR"]}>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-600">Reportes</p>
            <h1 className="mt-3 font-heading text-4xl font-bold text-slate-950">Indicadores de operación clínica</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => void exportPdf()} disabled={!report}>
              Exportar PDF
            </Button>
            <Button onClick={exportCsv} disabled={!report}>
              Exportar CSV
            </Button>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <StatsCard title="Citas hoy" value={report?.todayCitas ?? 0} hint="Atención programada para hoy" />
          <StatsCard title="Citas mes" value={report?.monthCitas ?? 0} hint="Carga mensual de agenda" />
          <StatsCard title="Pacientes nuevos" value={report?.newPacientesThisMonth ?? 0} hint="Altas registradas este mes" />
          <StatsCard title="Ingresos estimados" value={report?.estimatedRevenue ?? 0} hint="Suma de citas atendidas con precio estimado" />
        </div>

        <div className="grid gap-5 xl:grid-cols-2">
          <Card>
            <h2 className="font-heading text-2xl font-bold text-slate-950">Estados de citas</h2>
            <div className="mt-6 grid gap-3 md:grid-cols-2">
              <StatusItem label="Pendientes" value={report?.estadoBreakdown.pending ?? 0} />
              <StatusItem label="Confirmadas" value={report?.estadoBreakdown.confirmed ?? 0} />
              <StatusItem label="Canceladas" value={report?.estadoBreakdown.cancelled ?? 0} />
              <StatusItem label="Atendidas" value={report?.estadoBreakdown.attended ?? 0} />
              <StatusItem label="No asistió" value={report?.estadoBreakdown.noShow ?? 0} />
            </div>
          </Card>

          <Card>
            <h2 className="font-heading text-2xl font-bold text-slate-950">Tratamientos más solicitados</h2>
            <div className="mt-6 space-y-3">
              {(report?.topTratamientos ?? []).map((item) => (
                <div key={item.name} className="rounded-2xl border border-slate-200 p-4">
                  <p className="font-semibold text-slate-900">{item.name}</p>
                  <p className="text-sm text-slate-600">{item.total} citas registradas</p>
                </div>
              ))}
              {!report?.topTratamientos.length ? (
                <p className="text-sm text-slate-600">Aún no hay suficientes datos para esta vista.</p>
              ) : null}
            </div>
          </Card>
        </div>
      </div>
    </RoleGuard>
  );
}

function StatusItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 font-heading text-3xl font-bold text-slate-950">{value}</p>
    </div>
  );
}
