import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Filter, Loader2, Plus, Search, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";
import { createApplication, deleteApplication, listApplications, updateApplication } from "@/lib/app.functions";
import { toast } from "sonner";
import { z } from "zod";

export const Route = createFileRoute("/_authenticated/applications")({
  head: () => ({ meta: [{ title: "Applications — Placement Tracker Pro" }] }),
  component: ApplicationsPage,
});

const STATUS_LIST = ["applied", "review", "interview", "selected", "rejected", "offer"] as const;
const PRIORITY_LIST = ["low", "medium", "high"] as const;
const WORK_MODE_LIST = ["onsite", "remote", "hybrid"] as const;

const statusColor: Record<string, string> = {
  applied: "text-primary bg-primary/10 border-primary/30",
  review: "text-secondary bg-secondary/10 border-secondary/30",
  interview: "text-warning bg-warning/10 border-warning/30",
  selected: "text-success bg-success/10 border-success/30",
  rejected: "text-destructive bg-destructive/10 border-destructive/30",
  offer: "text-accent bg-accent/10 border-accent/30",
};

const priorityColor: Record<string, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-secondary/20 text-secondary",
  high: "bg-accent/20 text-accent",
};

function ApplicationsPage() {
  const list = useServerFn(listApplications);
  const create = useServerFn(createApplication);
  const update = useServerFn(updateApplication);
  const del = useServerFn(deleteApplication);
  const qc = useQueryClient();

  const { data: apps = [], isLoading } = useQuery({ queryKey: ["applications"], queryFn: () => list() });

  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    return apps.filter((a) => {
      const matchQ = q === "" || `${a.company_name} ${a.role} ${a.location ?? ""}`.toLowerCase().includes(q.toLowerCase());
      const matchS = statusFilter === "all" || a.status === statusFilter;
      return matchQ && matchS;
    });
  }, [apps, q, statusFilter]);

  const createMut = useMutation({
    mutationFn: (input: any) => create({ data: input }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["applications"] }); toast.success("Application added"); setOpen(false); },
    onError: (e: any) => toast.error(e.message ?? "Failed"),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["applications"] }); toast.success("Deleted"); },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: any }) => update({ data: { id, patch } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["applications"] }),
  });

  const bulkDelete = async () => {
    for (const id of selected) await deleteMut.mutateAsync(id);
    setSelected(new Set());
  };

  return (
    <div className="mx-auto max-w-7xl space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Applications</h1>
          <p className="text-sm text-muted-foreground">Search, filter, sort and manage your entire pipeline.</p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-secondary px-4 py-2.5 text-sm font-semibold text-white glow-primary hover:scale-[1.02] transition"
        >
          <Plus className="h-4 w-4" /> Add application
        </button>
      </div>

      <div className="glass flex flex-wrap items-center gap-2 rounded-2xl p-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Search company, role, location…"
            className="w-full rounded-xl border border-border bg-card/50 py-2 pl-9 pr-3 text-sm outline-none ring-primary/30 focus:ring-2"
          />
        </div>
        <div className="relative">
          <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <select
            value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="appearance-none rounded-xl border border-border bg-card/50 py-2 pl-9 pr-8 text-sm outline-none"
          >
            <option value="all">All statuses</option>
            {STATUS_LIST.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        </div>
        {selected.size > 0 && (
          <button
            onClick={bulkDelete}
            className="inline-flex items-center gap-2 rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive hover:bg-destructive/20"
          >
            <Trash2 className="h-4 w-4" /> Delete {selected.size}
          </button>
        )}
      </div>

      <div className="glass overflow-hidden rounded-2xl">
        <table className="w-full text-sm">
          <thead className="bg-card/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="w-10 px-3 py-3"></th>
              <th className="px-3 py-3">Company</th>
              <th className="px-3 py-3">Role</th>
              <th className="px-3 py-3">Location</th>
              <th className="px-3 py-3">Package</th>
              <th className="px-3 py-3">Deadline</th>
              <th className="px-3 py-3">Priority</th>
              <th className="px-3 py-3">Status</th>
              <th className="w-8 px-3 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr><td colSpan={9} className="py-10 text-center text-muted-foreground">
                <Loader2 className="mx-auto h-5 w-5 animate-spin" />
              </td></tr>
            )}
            {!isLoading && filtered.length === 0 && (
              <tr><td colSpan={9} className="py-16 text-center text-muted-foreground">
                No applications yet. Click <span className="text-foreground">Add application</span> to get started.
              </td></tr>
            )}
            {filtered.map((a) => (
              <motion.tr
                key={a.id}
                layout
                className="border-t border-border/60 transition hover:bg-card/40"
              >
                <td className="px-3 py-3">
                  <input
                    type="checkbox"
                    checked={selected.has(a.id)}
                    onChange={(e) => {
                      const next = new Set(selected);
                      if (e.target.checked) next.add(a.id); else next.delete(a.id);
                      setSelected(next);
                    }}
                  />
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-2">
                    <div className="grid h-7 w-7 place-items-center rounded-md bg-gradient-to-br from-primary/30 to-secondary/30 text-xs font-bold">{a.company_name[0]}</div>
                    <span className="font-medium">{a.company_name}</span>
                  </div>
                </td>
                <td className="px-3 py-3">{a.role}</td>
                <td className="px-3 py-3 text-muted-foreground">{a.location ?? "—"}</td>
                <td className="px-3 py-3 text-muted-foreground">{a.package ?? a.salary ?? "—"}</td>
                <td className="px-3 py-3 text-muted-foreground">{a.deadline ?? "—"}</td>
                <td className="px-3 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${priorityColor[a.priority ?? "medium"]}`}>{a.priority}</span>
                </td>
                <td className="px-3 py-3">
                  <select
                    defaultValue={a.status}
                    onChange={(e) => updateMut.mutate({ id: a.id, patch: { status: e.target.value as any } })}
                    className={`appearance-none rounded-full border px-2.5 py-0.5 text-xs ${statusColor[a.status]} bg-transparent`}
                  >
                    {STATUS_LIST.map((s) => <option key={s} value={s} className="bg-card text-foreground">{s}</option>)}
                  </select>
                </td>
                <td className="px-3 py-3">
                  <button onClick={() => deleteMut.mutate(a.id)} className="rounded-md p-1 text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {open && (
          <AddApplicationModal
            onClose={() => setOpen(false)}
            onSubmit={(v) => createMut.mutate(v)}
            saving={createMut.isPending}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

const AppSchema = z.object({
  company_name: z.string().trim().min(1, "Required"),
  role: z.string().trim().min(1, "Required"),
  location: z.string().trim().optional(),
  salary: z.string().trim().optional(),
  package: z.string().trim().optional(),
  work_mode: z.enum(WORK_MODE_LIST).optional(),
  applied_at: z.string().optional(),
  deadline: z.string().optional(),
  status: z.enum(STATUS_LIST).optional(),
  priority: z.enum(PRIORITY_LIST).optional(),
  notes: z.string().optional(),
});

function AddApplicationModal({
  onClose, onSubmit, saving,
}: {
  onClose: () => void;
  onSubmit: (v: any) => void;
  saving: boolean;
}) {
  const [form, setForm] = useState({
    company_name: "", role: "", location: "", salary: "", package: "",
    work_mode: "onsite", applied_at: new Date().toISOString().slice(0, 10),
    deadline: "", status: "applied", priority: "medium", notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = AppSchema.safeParse(form);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((i) => { errs[i.path.join(".")] = i.message; });
      setErrors(errs);
      return;
    }
    onSubmit({
      ...parsed.data,
      deadline: parsed.data.deadline || null,
    });
  };
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-background/60 backdrop-blur" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.98 }}
        className="fixed inset-0 z-50 grid place-items-center p-4"
      >
        <div className="glass-strong w-full max-w-2xl rounded-2xl p-6" onClick={(e) => e.stopPropagation()}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">Add application</h2>
            <button onClick={onClose} className="rounded-md p-1 text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
          </div>
          <form onSubmit={submit} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Company" error={errors.company_name}>
              <input value={form.company_name} onChange={(e) => set("company_name", e.target.value)} className={inp} />
            </Field>
            <Field label="Role" error={errors.role}>
              <input value={form.role} onChange={(e) => set("role", e.target.value)} className={inp} />
            </Field>
            <Field label="Location"><input value={form.location} onChange={(e) => set("location", e.target.value)} className={inp} /></Field>
            <Field label="Work mode">
              <select value={form.work_mode} onChange={(e) => set("work_mode", e.target.value)} className={inp}>
                {WORK_MODE_LIST.map((m) => <option key={m} className="bg-card">{m}</option>)}
              </select>
            </Field>
            <Field label="Salary"><input value={form.salary} onChange={(e) => set("salary", e.target.value)} className={inp} placeholder="$120k" /></Field>
            <Field label="Package"><input value={form.package} onChange={(e) => set("package", e.target.value)} className={inp} placeholder="18 LPA" /></Field>
            <Field label="Applied on"><input type="date" value={form.applied_at} onChange={(e) => set("applied_at", e.target.value)} className={inp} /></Field>
            <Field label="Deadline"><input type="date" value={form.deadline} onChange={(e) => set("deadline", e.target.value)} className={inp} /></Field>
            <Field label="Status">
              <select value={form.status} onChange={(e) => set("status", e.target.value)} className={inp}>
                {STATUS_LIST.map((s) => <option key={s} className="bg-card">{s}</option>)}
              </select>
            </Field>
            <Field label="Priority">
              <select value={form.priority} onChange={(e) => set("priority", e.target.value)} className={inp}>
                {PRIORITY_LIST.map((s) => <option key={s} className="bg-card">{s}</option>)}
              </select>
            </Field>
            <div className="sm:col-span-2">
              <Field label="Notes"><textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} className={`${inp} min-h-[80px]`} /></Field>
            </div>
            <div className="mt-2 flex items-center justify-end gap-2 sm:col-span-2">
              <button type="button" onClick={onClose} className="rounded-lg border border-border px-4 py-2 text-sm">Cancel</button>
              <button
                type="submit" disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-primary to-secondary px-4 py-2 text-sm font-semibold text-white glow-primary disabled:opacity-70"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                Save application
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </>
  );
}

const inp = "w-full rounded-lg border border-border bg-card/60 px-3 py-2 text-sm outline-none ring-primary/30 focus:ring-2";
function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1 text-xs font-medium text-muted-foreground">{label}</div>
      {children}
      {error && (
        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="mt-1 text-xs text-destructive">
          {error}
        </motion.div>
      )}
    </label>
  );
}
