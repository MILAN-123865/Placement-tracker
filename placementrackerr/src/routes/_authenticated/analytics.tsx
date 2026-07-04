import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listApplications } from "@/lib/app.functions";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { format, parseISO, subMonths } from "date-fns";
import { motion } from "framer-motion";

export const Route = createFileRoute("/_authenticated/analytics")({
  head: () => ({ meta: [{ title: "Analytics — Placement Tracker Pro" }] }),
  component: Analytics,
});

function Analytics() {
  const list = useServerFn(listApplications);
  const { data: apps = [] } = useQuery({ queryKey: ["applications"], queryFn: () => list() });

  const monthly = Array.from({ length: 6 }).map((_, i) => {
    const d = subMonths(new Date(), 5 - i);
    const key = format(d, "MMM yy");
    const value = apps.filter((a) => a.created_at && format(parseISO(a.created_at), "MMM yy") === key).length;
    return { month: key, value };
  });

  const statusData = ["applied", "review", "interview", "selected", "rejected", "offer"].map((s) => ({
    name: s,
    value: apps.filter((a) => a.status === s).length,
  }));

  const total = apps.length || 1;
  const offers = apps.filter((a) => a.status === "offer").length;
  const selected = apps.filter((a) => a.status === "selected" || a.status === "offer").length;

  const topLocations = Object.entries(
    apps.reduce<Record<string, number>>((acc, a) => {
      if (!a.location) return acc;
      acc[a.location] = (acc[a.location] ?? 0) + 1;
      return acc;
    }, {}),
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const cards = [
    { l: "Success rate", v: `${Math.round((selected / total) * 100)}%` },
    { l: "Offer ratio", v: `${Math.round((offers / total) * 100)}%` },
    { l: "Total applications", v: apps.length },
    { l: "Active pipeline", v: apps.filter((a) => a.status !== "rejected" && a.status !== "offer").length },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground">Zoom out and see what's actually working.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {cards.map((c, i) => (
          <motion.div key={c.l} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass rounded-2xl p-4">
            <div className="text-xs text-muted-foreground">{c.l}</div>
            <div className="mt-1 text-2xl font-bold gradient-text">{c.v}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="glass rounded-2xl p-5">
          <div className="mb-2 text-sm font-semibold">Applications per month</div>
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={10} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "rgba(15,23,42,0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }} />
                <Line type="monotone" dataKey="value" stroke="rgb(34,211,238)" strokeWidth={2} dot={{ fill: "rgb(99,102,241)" }} animationDuration={1200} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass rounded-2xl p-5">
          <div className="mb-2 text-sm font-semibold">Status distribution</div>
          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={40} outerRadius={80} paddingAngle={4} animationDuration={1200}>
                  {statusData.map((_, i) => <Cell key={i} fill={["#6366F1", "#22D3EE", "#F59E0B", "#22C55E", "#EF4444", "#F97316"][i % 6]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "rgba(15,23,42,0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 10 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass rounded-2xl p-5 lg:col-span-2">
          <div className="mb-2 text-sm font-semibold">Top locations</div>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={topLocations.map(([name, value]) => ({ name, value }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={10} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "rgba(15,23,42,0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }} />
                <Bar dataKey="value" fill="rgb(249,115,22)" radius={[6, 6, 0, 0]} animationDuration={1000} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
