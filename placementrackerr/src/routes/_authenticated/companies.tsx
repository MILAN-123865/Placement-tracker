import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { createCompany, listCompanies } from "@/lib/app.functions";
import { motion } from "framer-motion";
import { Building2, Globe, MapPin, Plus, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/companies")({
  head: () => ({ meta: [{ title: "Companies — Placement Tracker Pro" }] }),
  component: CompaniesPage,
});

function CompaniesPage() {
  const list = useServerFn(listCompanies);
  const create = useServerFn(createCompany);
  const qc = useQueryClient();
  const { data: companies = [] } = useQuery({ queryKey: ["companies"], queryFn: () => list() });
  const [open, setOpen] = useState(false);

  const mut = useMutation({
    mutationFn: (v: any) => create({ data: v }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["companies"] }); setOpen(false); toast.success("Company added"); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="mx-auto max-w-7xl space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Companies</h1>
          <p className="text-sm text-muted-foreground">Your personal company research board.</p>
        </div>
        <button onClick={() => setOpen(true)} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-secondary px-4 py-2.5 text-sm font-semibold text-white glow-primary hover:scale-[1.02]">
          <Plus className="h-4 w-4" /> Add company
        </button>
      </div>

      {companies.length === 0 ? (
        <div className="glass grid h-64 place-items-center rounded-2xl">
          <div className="text-center">
            <Building2 className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">No companies yet. Add your first one.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {companies.map((c, i) => (
            <motion.div key={c.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="glass card-hover rounded-2xl p-5">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-primary/30 to-secondary/30 text-lg font-bold">{c.name[0]}</div>
                <div>
                  <div className="text-sm font-semibold">{c.name}</div>
                  <div className="text-xs text-muted-foreground">{c.industry ?? "—"}</div>
                </div>
              </div>
              {c.description && <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{c.description}</p>}
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                {c.location && <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> {c.location}</span>}
                {c.website && <a href={c.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-foreground"><Globe className="h-3 w-3" /> Website</a>}
                {c.package_range && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-primary">{c.package_range}</span>}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {open && <AddCompanyModal onClose={() => setOpen(false)} onSubmit={(v) => mut.mutate(v)} />}
    </div>
  );
}

function AddCompanyModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (v: any) => void }) {
  const [f, setF] = useState({ name: "", industry: "", location: "", website: "", description: "", package_range: "" });
  const submit = (e: React.FormEvent) => { e.preventDefault(); if (!f.name.trim()) return; onSubmit(f); };
  return (
    <>
      <div className="fixed inset-0 z-50 bg-background/60 backdrop-blur" onClick={onClose} />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="fixed inset-0 z-50 grid place-items-center p-4">
        <div className="glass-strong w-full max-w-lg rounded-2xl p-6" onClick={(e) => e.stopPropagation()}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">Add company</h2>
            <button onClick={onClose}><X className="h-5 w-5" /></button>
          </div>
          <form onSubmit={submit} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input placeholder="Name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} className={inp} />
            <input placeholder="Industry" value={f.industry} onChange={(e) => setF({ ...f, industry: e.target.value })} className={inp} />
            <input placeholder="Location" value={f.location} onChange={(e) => setF({ ...f, location: e.target.value })} className={inp} />
            <input placeholder="Website" value={f.website} onChange={(e) => setF({ ...f, website: e.target.value })} className={inp} />
            <input placeholder="Package range (e.g. 12-20 LPA)" value={f.package_range} onChange={(e) => setF({ ...f, package_range: e.target.value })} className={`${inp} sm:col-span-2`} />
            <textarea placeholder="Description" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} className={`${inp} min-h-[80px] sm:col-span-2`} />
            <div className="flex justify-end gap-2 sm:col-span-2">
              <button type="button" onClick={onClose} className="rounded-lg border border-border px-4 py-2 text-sm">Cancel</button>
              <button type="submit" className="rounded-lg bg-gradient-to-r from-primary to-secondary px-4 py-2 text-sm font-semibold text-white glow-primary">Save</button>
            </div>
          </form>
        </div>
      </motion.div>
    </>
  );
}
const inp = "w-full rounded-lg border border-border bg-card/60 px-3 py-2 text-sm outline-none ring-primary/30 focus:ring-2";
