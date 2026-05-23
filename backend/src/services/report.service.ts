import { EstadoCita } from "@prisma/client";

import { prisma } from "@/config/prisma";

export async function getReportSummary() {
  // Reúne datos operativos para dashboard ejecutivo y módulo de reportes.
  const [
    citas,
    patients,
    treatments,
    todayCitasCount,
    monthCitasCount,
    cancelledCitasCount,
    noShowCitasCount
  ] = await Promise.all([
    prisma.cita.findMany({
      include: {
        tratamiento: true
      }
    }),
    prisma.paciente.findMany(),
    prisma.tratamiento.findMany(),
    prisma.cita.count({
      where: {
        programadaPara: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lt: new Date(new Date().setHours(23, 59, 59, 999))
        }
      }
    }),
    prisma.cita.count({
      where: {
        programadaPara: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
        }
      }
    }),
    prisma.cita.count({
      where: { estado: EstadoCita.CANCELADA }
    }),
    prisma.cita.count({
      where: { estado: EstadoCita.NO_ASISTIO }
    })
  ]);

  const newPacientesThisMonth = patients.filter((patient) => {
    const creadoEn = new Date(patient.creadoEn);
    const now = new Date();
    return creadoEn.getMonth() === now.getMonth() && creadoEn.getFullYear() === now.getFullYear();
  }).length;

  const treatmentDemandMap = new Map<string, { name: string; total: number }>();
  let estimatedRevenue = 0;

  for (const appointment of citas) {
    const current = treatmentDemandMap.get(appointment.tratamientoId) ?? {
      name: appointment.tratamiento.nombre,
      total: 0
    };

    current.total += 1;
    treatmentDemandMap.set(appointment.tratamientoId, current);

    if (appointment.estado === EstadoCita.ATENDIDA && appointment.tratamiento.precioEstimado) {
      estimatedRevenue += Number(appointment.tratamiento.precioEstimado);
    }
  }

  const topTratamientos = Array.from(treatmentDemandMap.values())
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  const statusBreakdown = {
    pending: citas.filter((item) => item.estado === EstadoCita.PENDIENTE).length,
    confirmed: citas.filter((item) => item.estado === EstadoCita.CONFIRMADA).length,
    cancelled: cancelledCitasCount,
    attended: citas.filter((item) => item.estado === EstadoCita.ATENDIDA).length,
    noShow: noShowCitasCount
  };

  return {
    todayCitas: todayCitasCount,
    monthCitas: monthCitasCount,
    newPacientesThisMonth,
    cancelledCitas: cancelledCitasCount,
    noShowCitas: noShowCitasCount,
    estimatedRevenue,
    totalPacientes: patients.length,
    totalTratamientos: treatments.length,
    statusBreakdown,
    topTratamientos
  };
}
