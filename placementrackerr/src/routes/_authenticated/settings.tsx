import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Bell, Globe, Moon, Shield, Sun, Trash2 } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Settings — Placement Tracker Pro" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [notif, setNotif] = useState(true);
  const [language, setLanguage] = useState("en");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const nav = useNavigate();
  const qc = useQueryClient();

  const del = async () => {
    // We can't fully delete the auth user from the client — sign out instead and tell them
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    toast.info("You've been signed out. Contact support to permanently delete your account.");
    nav({ to: "/auth", replace: true });
  };

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <h1 className="text-3xl font-bold tracking-tight">Settings</h1>

      <Section title="Appearance" icon={theme === "dark" ? Moon : Sun}>
        <div className="flex gap-2">
          {(["dark", "light"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={`relative flex-1 rounded-xl border p-4 text-left transition ${
                theme === t ? "border-primary/60 bg-primary/10" : "border-border bg-card/40 hover:bg-card/70"
              }`}
            >
              <div className="text-sm font-semibold capitalize">{t} mode</div>
              <div className="text-xs text-muted-foreground">{t === "dark" ? "Perfect for late-night hunts." : "Bright and airy."}</div>
              {theme === t && <motion.span layoutId="theme-check" className="absolute right-3 top-3 h-2 w-2 rounded-full bg-primary shadow-[0_0_10px_theme(colors.primary)]" />}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Notifications" icon={Bell}>
        <Toggle label="Email notifications for deadlines" value={notif} onChange={setNotif} />
      </Section>

      <Section title="Language" icon={Globe}>
        <select value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full max-w-xs rounded-lg border border-border bg-card/60 px-3 py-2 text-sm">
          <option value="en">English</option>
          <option value="es">Español</option>
          <option value="fr">Français</option>
          <option value="hi">हिन्दी</option>
        </select>
      </Section>

      <Section title="Privacy" icon={Shield}>
        <p className="text-sm text-muted-foreground">Your data is protected by row-level security. Only you can access your applications, resumes and analytics.</p>
      </Section>

      <div className="glass rounded-2xl border border-destructive/30 p-6">
        <div className="flex items-center gap-2 text-destructive"><Trash2 className="h-4 w-4" /><h3 className="text-sm font-semibold">Delete account</h3></div>
        <p className="mt-2 text-sm text-muted-foreground">This will sign you out immediately. Contact support to permanently remove your data.</p>
        {!confirmDelete ? (
          <button onClick={() => setConfirmDelete(true)} className="mt-3 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-2 text-sm text-destructive hover:bg-destructive/20">
            Delete my account
          </button>
        ) : (
          <div className="mt-3 flex gap-2">
            <button onClick={del} className="rounded-lg bg-destructive px-4 py-2 text-sm text-destructive-foreground">Confirm</button>
            <button onClick={() => setConfirmDelete(false)} className="rounded-lg border border-border px-4 py-2 text-sm">Cancel</button>
          </div>
        )}
      </div>
    </div>
  );
}

function Section({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6">
      <div className="mb-3 flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-semibold">{title}</h2>
      </div>
      {children}
    </motion.div>
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between">
      <span className="text-sm">{label}</span>
      <button
        role="switch" aria-checked={value}
        onClick={() => onChange(!value)}
        className={`relative h-6 w-11 rounded-full transition ${value ? "bg-primary" : "bg-muted"}`}
      >
        <motion.span
          animate={{ x: value ? 22 : 2 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="absolute top-1 h-4 w-4 rounded-full bg-white shadow"
        />
      </button>
    </label>
  );
}
