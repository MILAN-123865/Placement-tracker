import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { motion } from "framer-motion";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import {
  AlertCircle, Briefcase, Building2, Calendar as CalendarIcon, CheckCircle2, Clock, Loader2, Plus,
  Send, Sparkles, TrendingUp, XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { listApplications } from "@/lib/app.functions";
import { format, formatDistanceToNow, parseISO, subDays } from "date-fns";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Placement Tracker Pro" }] }),
  component: Dashboard,
});

function Counter({ to }: { to: number }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const dur = 900;
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      setN(Math.floor(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to]);
  return <>{n}</>;
}

const STAT_META = [
  { key: "total", label: "Total", icon: Briefcase, color: "from-primary to-secondary" },
  { key: "applied", label: "Applied", icon: Send, color: "from-primary to-primary-glow" },
  { key: "review", label: "In Review", icon: Clock, color: "from-secondary to-primary" },
  { key: "selected", label: "Selected", icon: CheckCircle2, color: "from-success to-secondary" },
  { key: "rejected", label: "Rejected", icon: XCircle, color: "from-destructive to-accent" },
  { key: "offer", label: "Offers", icon: Sparkles, color: "from-accent to-primary" },
] as const;

function Dashboard() {
  const list = useServerFn(listApplications);
  const nav = useNavigate();
  const { data: apps = [], isLoading } = useQuery({ queryKey: ["applications"], queryFn: () => list() });

  const counts = {
    total: apps.length,
    applied: apps.filter((a) => a.status === "applied").length,
    review: apps.filter((a) => a.status === "review" || a.status === "interview").length,
    selected: apps.filter((a) => a.status === "selected").length,
    rejected: apps.filter((a) => a.status === "rejected").length,
    offer: apps.filter((a) => a.status === "offer").length,
  };

  // Last 30 days area chart
  const areaData = Array.from({ length: 30 }).map((_, i) => {
    const day = subDays(new Date(), 29 - i);
    const key = format(day, "MMM d");
    const count = apps.filter((a) => a.created_at && format(parseISO(a.created_at), "MMM d") === key).length;
    return { day: key, count };
  });

  const pieData = STAT_META.slice(1).map((s) => ({ name: s.label, value: (counts as any)[s.key] as number }));
  const barData = Object.entries(
    apps.reduce<Record<string, number>>((acc, a) => {
      acc[a.company_name] = (acc[a.company_name] ?? 0) + 1;
      return acc;
    }, {}),
  ).slice(0, 6).map(([name, value]) => ({ name, value }));

  const upcoming = apps
    .filter((a) => a.deadline)
    .sort((a, b) => (a.deadline! < b.deadline! ? -1 : 1))
    .slice(0, 5);

  const recent = [...apps].slice(0, 6);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Everything you need to run a smart job hunt.</p>
        </div>
        <button
          onClick={() => nav({ to: "/applications" })}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-secondary px-4 py-2.5 text-sm font-semibold text-white transition hover:scale-[1.02] glow-primary"
        >
          <Plus className="h-4 w-4" /> New application
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {STAT_META.map((s, i) => (
          <motion.div
            key={s.key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="glass card-hover rounded-2xl p-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{s.label}</span>
              <div className={`grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br ${s.color} text-white`}>
                <s.icon className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-bold">
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /> : <Counter to={(counts as any)[s.key]} />}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="glass rounded-2xl p-5 lg:col-span-2">
          <div className="mb-2 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">Applications over time</div>
              <div className="text-xs text-muted-foreground">Last 30 days</div>
            </div>
            <TrendingUp className="h-4 w-4 text-primary" />
          </div>
          <div className="h-64">
            <ResponsiveContainer>
              <AreaChart data={areaData}>
                <defs>
                  <linearGradient id="area1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(240 82% 65%)" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="hsl(240 82% 65%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={10} interval={5} />
                <YAxis stroke="#94a3b8" fontSize={10} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "rgba(15,23,42,0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }} />
                <Area type="monotone" dataKey="count" stroke="rgb(99,102,241)" fill="url(#area1)" strokeWidth={2} animationDuration={1200} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass rounded-2xl p-5">
          <div className="text-sm font-semibold">Status breakdown</div>
          <div className="text-xs text-muted-foreground">All applications</div>
          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={4} animationDuration={1200}>
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={["#6366F1", "#22D3EE", "#22C55E", "#EF4444", "#F97316"][i % 5]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "rgba(15,23,42,0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="glass rounded-2xl p-5">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-sm font-semibold">Top companies</div>
            <Building2 className="h-4 w-4 text-secondary" />
          </div>
          <div className="h-56">
            <ResponsiveContainer>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={10} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "rgba(15,23,42,0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }} />
                <Bar dataKey="value" fill="rgb(34,211,238)" radius={[6, 6, 0, 0]} animationDuration={1000} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass rounded-2xl p-5">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-sm font-semibold">Upcoming deadlines</div>
            <CalendarIcon className="h-4 w-4 text-accent" />
          </div>
          {upcoming.length === 0 ? (
            <div className="grid h-40 place-items-center text-center text-xs text-muted-foreground">
              No upcoming deadlines. You're all clear.
            </div>
          ) : (
            <ul className="space-y-2">
              {upcoming.map((a) => (
                <li key={a.id} className="flex items-center justify-between rounded-xl border border-border/60 bg-card/40 p-2.5">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{a.role}</div>
                    <div className="truncate text-xs text-muted-foreground">{a.company_name}</div>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    {a.deadline ? formatDistanceToNow(parseISO(a.deadline), { addSuffix: true }) : "-"}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="glass rounded-2xl p-5">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-sm font-semibold">Recent activity</div>
            <AlertCircle className="h-4 w-4 text-primary" />
          </div>
          {recent.length === 0 ? (
            <div className="grid h-40 place-items-center text-center text-xs text-muted-foreground">
              Add your first application to see activity here.
            </div>
          ) : (
            <ul className="space-y-2">
              {recent.map((a) => (
                <li key={a.id} className="flex items-center gap-3">
                  <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-primary/30 to-secondary/30 text-xs font-bold">
                    {a.company_name[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm">{a.role} <span className="text-muted-foreground">at {a.company_name}</span></div>
                    <div className="text-xs text-muted-foreground">{a.created_at ? formatDistanceToNow(parseISO(a.created_at), { addSuffix: true }) : ""}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
