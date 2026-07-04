import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { ArrowRight, Loader2, Lock, Mail, Sparkles, User } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Placement Tracker Pro" },
      { name: "description", content: "Sign in or create your Placement Tracker Pro account." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

type Mode = "login" | "register" | "forgot";

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("login");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard", replace: true });
    });
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "login") {
        const parsed = z.object({ email: z.string().email(), password: z.string().min(6) }).safeParse({ email, password });
        if (!parsed.success) { toast.error("Enter a valid email and password (6+ chars)."); return; }
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back!");
        navigate({ to: "/dashboard" });
      } else if (mode === "register") {
        const parsed = z
          .object({ email: z.string().email(), password: z.string().min(6), name: z.string().trim().min(1).max(80) })
          .safeParse({ email, password, name });
        if (!parsed.success) { toast.error("Fill all fields correctly."); return; }
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin, data: { full_name: name } },
        });
        if (error) throw error;
        toast.success("Account created — you're in!");
        navigate({ to: "/dashboard" });
      } else {
        const parsed = z.object({ email: z.string().email() }).safeParse({ email });
        if (!parsed.success) { toast.error("Enter a valid email."); return; }
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + "/auth",
        });
        if (error) throw error;
        toast.success("Password reset email sent.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const google = async () => {
    setLoading(true);
    try {
      const res = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
      if (res.error) { toast.error("Google sign-in failed"); return; }
      if (res.redirected) return;
      navigate({ to: "/dashboard" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-10">
      {/* Animated blobs (in addition to global bg) */}
      <motion.div
        className="pointer-events-none absolute left-1/4 top-1/4 h-72 w-72 rounded-full bg-primary/30 blur-3xl"
        animate={{ scale: [1, 1.2, 1], x: [0, 30, 0], y: [0, -20, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="pointer-events-none absolute right-1/4 bottom-1/4 h-80 w-80 rounded-full bg-secondary/30 blur-3xl"
        animate={{ scale: [1, 1.15, 1], x: [0, -20, 0], y: [0, 30, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="glass-strong relative w-full max-w-md rounded-3xl p-8"
      >
        <Link to="/" className="mb-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-secondary">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          Placement Tracker Pro
        </Link>

        <h1 className="text-2xl font-bold tracking-tight">
          {mode === "login" ? "Welcome back" : mode === "register" ? "Create your account" : "Reset your password"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {mode === "login" ? "Sign in to continue tracking." : mode === "register" ? "Start winning your job hunt today." : "We'll email you a reset link."}
        </p>

        {mode !== "forgot" && (
          <button
            onClick={google}
            disabled={loading}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card/60 px-4 py-2.5 text-sm font-medium transition hover:bg-card"
          >
            <svg width="16" height="16" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.4 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.1 35 26.6 36 24 36c-5.2 0-9.7-3.3-11.3-8l-6.5 5C9.4 39.6 16.1 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.2 5.6l6.2 5.2C41.3 34.7 44 29.7 44 24c0-1.2-.1-2.4-.4-3.5z"/></svg>
            Continue with Google
          </button>
        )}

        {mode !== "forgot" && (
          <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" /> OR <div className="h-px flex-1 bg-border" />
          </div>
        )}

        <form onSubmit={submit} className="space-y-3">
          <AnimatePresence mode="popLayout">
            {mode === "register" && (
              <motion.div
                key="name"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Full name</label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={name} onChange={(e) => setName(e.target.value)}
                    placeholder="Ada Lovelace"
                    className="w-full rounded-xl border border-border bg-card/60 py-2.5 pl-9 pr-3 text-sm outline-none ring-primary/40 focus:ring-2"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Email</label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-border bg-card/60 py-2.5 pl-9 pr-3 text-sm outline-none ring-primary/40 focus:ring-2"
              />
            </div>
          </div>

          {mode !== "forgot" && (
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Password</label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full rounded-xl border border-border bg-card/60 py-2.5 pl-9 pr-3 text-sm outline-none ring-primary/40 focus:ring-2"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-secondary py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.01] disabled:opacity-70 glow-primary"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>
              {mode === "login" ? "Sign in" : mode === "register" ? "Create account" : "Send reset link"}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </>}
          </button>
        </form>

        <div className="mt-5 flex items-center justify-between text-xs text-muted-foreground">
          {mode === "login" ? (
            <>
              <button onClick={() => setMode("forgot")} className="hover:text-foreground">Forgot password?</button>
              <button onClick={() => setMode("register")} className="hover:text-foreground">Create account</button>
            </>
          ) : mode === "register" ? (
            <>
              <span />
              <button onClick={() => setMode("login")} className="hover:text-foreground">Have an account? Sign in</button>
            </>
          ) : (
            <>
              <span />
              <button onClick={() => setMode("login")} className="hover:text-foreground">Back to sign in</button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
