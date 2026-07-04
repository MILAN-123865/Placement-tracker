import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getProfile, updateProfile } from "@/lib/app.functions";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Github, Globe, Linkedin, Loader2, Plus, Twitter, X } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({ meta: [{ title: "Profile — Placement Tracker Pro" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const get = useServerFn(getProfile);
  const upd = useServerFn(updateProfile);
  const qc = useQueryClient();
  const { user } = useAuth();
  const { data: profile } = useQuery({ queryKey: ["profile"], queryFn: () => get() });

  const [form, setForm] = useState({ full_name: "", headline: "", skills: [] as string[], socials: {} as Record<string, string> });
  const [skillInput, setSkillInput] = useState("");

  useEffect(() => {
    if (profile) setForm({
      full_name: profile.full_name ?? "",
      headline: profile.headline ?? "",
      skills: (profile.skills as string[]) ?? [],
      socials: (profile.socials as Record<string, string>) ?? {},
    });
  }, [profile]);

  const mut = useMutation({
    mutationFn: (v: any) => upd({ data: v }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["profile"] }); toast.success("Profile saved"); },
    onError: (e: any) => toast.error(e.message),
  });

  const initial = (form.full_name || user?.email || "?").slice(0, 1).toUpperCase();

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <h1 className="text-3xl font-bold tracking-tight">Profile</h1>

      <div className="glass rounded-2xl p-6">
        <div className="flex items-center gap-4">
          <motion.div whileHover={{ scale: 1.05 }} className="grid h-20 w-20 place-items-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-3xl font-bold text-white shadow-lg">
            {initial}
          </motion.div>
          <div>
            <div className="text-lg font-semibold">{form.full_name || user?.email}</div>
            <div className="text-sm text-muted-foreground">{form.headline || "Add a headline"}</div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="block">
            <div className="mb-1 text-xs font-medium text-muted-foreground">Full name</div>
            <input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className={inp} />
          </label>
          <label className="block">
            <div className="mb-1 text-xs font-medium text-muted-foreground">Headline</div>
            <input value={form.headline} onChange={(e) => setForm({ ...form, headline: e.target.value })} className={inp} placeholder="Senior Software Engineer" />
          </label>
        </div>

        <div className="mt-4">
          <div className="mb-1 text-xs font-medium text-muted-foreground">Skills</div>
          <div className="flex flex-wrap gap-2 rounded-lg border border-border bg-card/60 p-2">
            {form.skills.map((s) => (
              <span key={s} className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2.5 py-0.5 text-xs text-primary">
                {s}
                <button onClick={() => setForm({ ...form, skills: form.skills.filter((x) => x !== s) })}><X className="h-3 w-3" /></button>
              </span>
            ))}
            <input
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && skillInput.trim()) {
                  e.preventDefault();
                  setForm({ ...form, skills: [...form.skills, skillInput.trim()] });
                  setSkillInput("");
                }
              }}
              placeholder="Type and press Enter"
              className="min-w-[120px] flex-1 bg-transparent text-sm outline-none"
            />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { k: "github", i: Github, ph: "github.com/you" },
            { k: "linkedin", i: Linkedin, ph: "linkedin.com/in/you" },
            { k: "twitter", i: Twitter, ph: "twitter.com/you" },
          ].map(({ k, i: Icon, ph }) => (
            <label key={k} className="block">
              <div className="mb-1 flex items-center gap-1 text-xs font-medium text-muted-foreground"><Icon className="h-3 w-3" /> {k}</div>
              <input
                value={form.socials[k] ?? ""}
                onChange={(e) => setForm({ ...form, socials: { ...form.socials, [k]: e.target.value } })}
                className={inp} placeholder={ph}
              />
            </label>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={() => mut.mutate(form)}
            disabled={mut.isPending}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-secondary px-5 py-2.5 text-sm font-semibold text-white glow-primary disabled:opacity-70"
          >
            {mut.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Save profile
          </button>
        </div>
      </div>
    </div>
  );
}
const inp = "w-full rounded-lg border border-border bg-card/60 px-3 py-2 text-sm outline-none ring-primary/30 focus:ring-2";
