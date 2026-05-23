import { Card } from "@/components/ui/card";

export function StatsCard({ title, value, hint }: { title: string; value: number; hint: string }) {
  return (
    <Card>
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <p className="mt-4 font-heading text-4xl font-bold text-slate-950">{value}</p>
      <p className="mt-2 text-sm text-slate-600">{hint}</p>
    </Card>
  );
}
