import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listApplications } from "@/lib/app.functions";
import { motion } from "framer-motion";
import { addDays, addMonths, endOfMonth, format, isSameDay, isSameMonth, parseISO, startOfMonth, startOfWeek, subMonths } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/_authenticated/calendar")({
  head: () => ({ meta: [{ title: "Calendar — Placement Tracker Pro" }] }),
  component: CalendarPage,
});

function CalendarPage() {
  const list = useServerFn(listApplications);
  const { data: apps = [] } = useQuery({ queryKey: ["applications"], queryFn: () => list() });
  const [cursor, setCursor] = useState(new Date());
  const start = startOfWeek(startOfMonth(cursor));
  const days = useMemo(() => Array.from({ length: 42 }).map((_, i) => addDays(start, i)), [start]);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, { title: string; type: string; color: string }[]>();
    for (const a of apps) {
      if (a.deadline) {
        const k = a.deadline;
        const arr = map.get(k) ?? [];
        arr.push({ title: `${a.role} — ${a.company_name}`, type: "deadline", color: "bg-accent/30 text-accent" });
        map.set(k, arr);
      }
      if (a.status === "offer" && a.updated_at) {
        const k = format(parseISO(a.updated_at), "yyyy-MM-dd");
        const arr = map.get(k) ?? [];
        arr.push({ title: `Offer: ${a.company_name}`, type: "offer", color: "bg-success/30 text-success" });
        map.set(k, arr);
      }
    }
    return map;
  }, [apps]);

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
          <p className="text-sm text-muted-foreground">Deadlines and offers at a glance.</p>
        </div>
        <div className="flex items-center gap-1 rounded-xl glass p-1">
          <button onClick={() => setCursor(subMonths(cursor, 1))} className="rounded-lg p-2 text-muted-foreground hover:text-foreground"><ChevronLeft className="h-4 w-4" /></button>
          <div className="min-w-[140px] px-2 text-center text-sm font-semibold">{format(cursor, "MMMM yyyy")}</div>
          <button onClick={() => setCursor(addMonths(cursor, 1))} className="rounded-lg p-2 text-muted-foreground hover:text-foreground"><ChevronRight className="h-4 w-4" /></button>
        </div>
      </div>

      <div className="glass rounded-2xl p-4">
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] uppercase tracking-wider text-muted-foreground">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => <div key={d} className="py-2">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((d, i) => {
            const key = format(d, "yyyy-MM-dd");
            const events = eventsByDay.get(key) ?? [];
            const inMonth = isSameMonth(d, cursor);
            const today = isSameDay(d, new Date());
            return (
              <motion.div
                key={key}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.005 }}
                className={`min-h-[92px] rounded-lg border p-1.5 text-left text-xs transition ${
                  today ? "border-primary/60 bg-primary/10" : "border-border/60 bg-card/30"
                } ${inMonth ? "" : "opacity-40"}`}
              >
                <div className="text-[10px] font-semibold">{format(d, "d")}</div>
                <div className="mt-1 space-y-1">
                  {events.slice(0, 2).map((e, k) => (
                    <div key={k} className={`truncate rounded px-1.5 py-0.5 text-[10px] ${e.color}`}>{e.title}</div>
                  ))}
                  {events.length > 2 && <div className="text-[10px] text-muted-foreground">+{events.length - 2} more</div>}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
