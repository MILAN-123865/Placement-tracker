import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Bell,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileText,
  Github,
  LayoutDashboard,
  LineChart,
  Rocket,
  Shield,
  Sparkles,
  Star,
  Twitter,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Placement Tracker Pro — Track every job application" },
      {
        name: "description",
        content:
          "The premium job application tracker. Dashboards, deadlines, analytics, and resume versions in one beautiful workspace.",
      },
    ],
  }),
  component: Landing,
});

function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const dur = 1400;
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
  return <>{n.toLocaleString()}{suffix}</>;
}

function Landing() {
  return (
    <div className="relative min-h-screen">
      {/* Navbar */}
      <header className="sticky top-0 z-40 w-full">
        <div className="mx-auto mt-4 flex max-w-6xl items-center justify-between rounded-2xl px-4 py-3 glass">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-secondary shadow-lg">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-semibold tracking-tight">Placement Tracker Pro</span>
          </Link>
          <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
            <a href="#features" className="hover:text-foreground transition">Features</a>
            <a href="#showcase" className="hover:text-foreground transition">Product</a>
            <a href="#testimonials" className="hover:text-foreground transition">Reviews</a>
            <a href="#faq" className="hover:text-foreground transition">FAQ</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/auth" className="hidden rounded-lg px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground sm:inline">
              Sign in
            </Link>
            <Link
              to="/auth"
              className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-primary to-secondary px-3.5 py-2 text-sm font-medium text-white transition-transform hover:scale-[1.03] glow-primary"
            >
              Get started <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative mx-auto max-w-6xl px-4 pt-24 pb-32 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-3 py-1 text-xs text-muted-foreground"
        >
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-success" />
          Now with AI-ready insights
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.05 }}
          className="mt-6 text-5xl font-bold leading-[1.05] tracking-tight sm:text-7xl"
        >
          Track Every Job Application.
          <br />
          <span className="gradient-text">Land Your Dream Job.</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground"
        >
          The premium workspace built for job seekers, students, and career professionals.
          Beautiful dashboards, deadline reminders, and analytics that actually help you win.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          <Link
            to="/auth"
            className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-secondary px-5 py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.03] glow-primary"
          >
            Start Tracking <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <a
            href="#showcase"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card/50 px-5 py-3 text-sm font-medium text-foreground backdrop-blur transition hover:bg-card"
          >
            Live Demo
          </a>
        </motion.div>

        {/* Floating dashboard preview */}
        <motion.div
          initial={{ opacity: 0, y: 60, rotateX: 10 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
          className="relative mx-auto mt-16 max-w-5xl"
          style={{ perspective: 1400 }}
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="relative rounded-2xl border border-border glass-strong p-4 shadow-2xl"
          >
            <div className="flex items-center gap-1.5 pb-3">
              <span className="h-2.5 w-2.5 rounded-full bg-destructive/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-warning/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-success/70" />
              <span className="ml-3 text-xs text-muted-foreground">app.placementtracker.pro / dashboard</span>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
              {[
                { l: "Total", v: 128, c: "from-primary to-secondary" },
                { l: "Interview", v: 24, c: "from-secondary to-primary" },
                { l: "Selected", v: 9, c: "from-success to-secondary" },
                { l: "Offers", v: 3, c: "from-accent to-primary" },
              ].map((s) => (
                <div key={s.l} className="rounded-xl border border-border bg-card/60 p-3">
                  <div className="text-xs text-muted-foreground">{s.l}</div>
                  <div className={`mt-1 bg-gradient-to-r ${s.c} bg-clip-text text-2xl font-bold text-transparent`}>
                    <Counter to={s.v} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="col-span-2 h-56 rounded-xl border border-border bg-card/60 p-4">
                <div className="mb-2 text-xs text-muted-foreground">Applications over time</div>
                <svg viewBox="0 0 400 160" className="h-full w-full">
                  <defs>
                    <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="rgba(99,102,241,0.6)" />
                      <stop offset="100%" stopColor="rgba(99,102,241,0)" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0,120 C40,100 80,60 120,70 C160,80 200,40 240,30 C280,20 320,60 360,50 L400,45 L400,160 L0,160 Z"
                    fill="url(#g1)"
                  />
                  <path
                    d="M0,120 C40,100 80,60 120,70 C160,80 200,40 240,30 C280,20 320,60 360,50 L400,45"
                    stroke="rgb(99,102,241)"
                    strokeWidth="2"
                    fill="none"
                  />
                </svg>
              </div>
              <div className="h-56 rounded-xl border border-border bg-card/60 p-4">
                <div className="mb-2 text-xs text-muted-foreground">Status</div>
                <div className="space-y-2">
                  {[
                    { l: "Applied", v: 60, c: "bg-primary" },
                    { l: "Review", v: 40, c: "bg-secondary" },
                    { l: "Selected", v: 25, c: "bg-success" },
                    { l: "Offer", v: 12, c: "bg-accent" },
                  ].map((r) => (
                    <div key={r.l}>
                      <div className="flex justify-between text-[10px] text-muted-foreground">
                        <span>{r.l}</span><span>{r.v}%</span>
                      </div>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${r.v}%` }}
                          transition={{ duration: 1.4, ease: "easeOut" }}
                          className={`h-full ${r.c}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Trusted */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="text-center text-xs uppercase tracking-widest text-muted-foreground">
          Trusted by students & professionals from
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4 opacity-70 sm:grid-cols-3 md:grid-cols-6">
          {["Google", "Stripe", "Vercel", "Linear", "Notion", "Figma"].map((n) => (
            <div key={n} className="rounded-lg border border-border/50 bg-card/40 py-3 text-center text-sm font-semibold text-muted-foreground">
              {n}
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-4 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">Everything you need to win the job hunt</h2>
          <p className="mt-4 text-muted-foreground">
            Built on top of the workflows we wished existed. Fast, focused, beautiful.
          </p>
        </div>
        <div className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[
            { i: LayoutDashboard, t: "Premium dashboard", d: "See your entire pipeline at a glance with rich, animated cards and charts." },
            { i: LineChart, t: "Deep analytics", d: "Understand response times, offer ratios and where your time pays off." },
            { i: Calendar, t: "Deadlines that don't slip", d: "Beautiful calendar view with reminders for every interview and offer." },
            { i: FileText, t: "Resume versions", d: "Upload, preview, and match resumes to specific applications." },
            { i: Bell, t: "Smart notifications", d: "Only the pings that matter. Never miss a decision or interview again." },
            { i: Shield, t: "Private by design", d: "Row-level security. Your data stays yours, always." },
          ].map((f, i) => (
            <motion.div
              key={f.t}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="glass card-hover rounded-2xl p-6"
            >
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 text-primary">
                <f.i className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">{f.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.d}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="glass grid grid-cols-2 gap-4 rounded-2xl p-8 sm:grid-cols-4">
          {[
            { k: "Applications tracked", v: 250000 },
            { k: "Offers landed", v: 8400 },
            { k: "Companies indexed", v: 12000 },
            { k: "Avg. response time", v: 6, s: "d" },
          ].map((s) => (
            <div key={s.k}>
              <div className="text-3xl font-bold gradient-text">
                <Counter to={s.v} suffix={s.s ?? "+"} />
              </div>
              <div className="mt-1 text-xs text-muted-foreground">{s.k}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Showcase */}
      <section id="showcase" className="mx-auto max-w-6xl px-4 py-20">
        <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-2">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-3 py-1 text-xs text-muted-foreground">
              <Zap className="h-3 w-3" /> Built for speed
            </div>
            <h2 className="mt-4 text-4xl font-bold tracking-tight">A workflow you'll actually use</h2>
            <p className="mt-3 text-muted-foreground">
              Add applications in seconds. Filter, sort, tag and bulk-update. Every interaction is
              tuned to feel instant, with keyboard shortcuts everywhere.
            </p>
            <ul className="mt-6 space-y-2 text-sm">
              {["Command palette everywhere", "Bulk actions with undo", "Live sync across devices", "Elegant dark & light themes"].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success" /> {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="glass rounded-2xl p-4">
            <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
              <span>Applications</span>
              <span className="rounded bg-muted px-2 py-0.5">128 items</span>
            </div>
            {[
              { c: "Stripe", r: "Frontend Engineer", s: "Interview", t: "warning" },
              { c: "Vercel", r: "Product Designer", s: "Offer", t: "success" },
              { c: "Linear", r: "SWE Intern", s: "Applied", t: "primary" },
              { c: "Notion", r: "Design Eng", s: "Review", t: "secondary" },
            ].map((row, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="flex items-center justify-between rounded-xl border border-transparent p-3 transition hover:border-border hover:bg-card/60"
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-primary/30 to-secondary/30 text-xs font-bold">
                    {row.c[0]}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{row.c}</div>
                    <div className="text-xs text-muted-foreground">{row.r}</div>
                  </div>
                </div>
                <span
                  className={`rounded-full border border-border/60 bg-${row.t}/10 px-2.5 py-0.5 text-xs`}
                  style={{
                    color:
                      row.t === "success" ? "rgb(34,197,94)" :
                      row.t === "warning" ? "rgb(245,158,11)" :
                      row.t === "secondary" ? "rgb(34,211,238)" :
                      "rgb(99,102,241)",
                  }}
                >
                  {row.s}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="mx-auto max-w-6xl px-4 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-4xl font-bold tracking-tight">Loved by candidates who ship</h2>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3">
          {[
            { n: "Aisha K.", r: "CS Senior, IIT-B", q: "Landed 4 offers in a semester. This tool paid for itself in a week." },
            { n: "Marco P.", r: "Product Designer", q: "The analytics are so good I almost feel bad for people not using it." },
            { n: "Priya S.", r: "SWE Intern", q: "Deadlines never slipped once. The UI is genuinely joyful." },
          ].map((t, i) => (
            <motion.div
              key={t.n}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="glass card-hover rounded-2xl p-6"
            >
              <div className="flex gap-0.5 text-warning">
                {Array.from({ length: 5 }).map((_, k) => <Star key={k} className="h-4 w-4 fill-current" />)}
              </div>
              <p className="mt-3 text-sm text-foreground/90">"{t.q}"</p>
              <div className="mt-4 text-xs text-muted-foreground">{t.n} • {t.r}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl px-4 py-20">
        <h2 className="text-center text-4xl font-bold tracking-tight">Questions, answered</h2>
        <div className="mt-10 space-y-3">
          {[
            { q: "Is it free?", a: "Yes — the core tracker is completely free. Premium analytics are coming soon." },
            { q: "Do you support Google sign-in?", a: "Yes. One tap and you're in." },
            { q: "Is my data private?", a: "Absolutely. Every table is protected by row-level security." },
            { q: "Can I export?", a: "Yes, CSV export is coming this quarter." },
          ].map((f) => (
            <details key={f.q} className="glass group rounded-xl p-4 open:pb-5">
              <summary className="flex cursor-pointer items-center justify-between text-sm font-medium">
                {f.q}
                <ChevronRight className="h-4 w-4 transition-transform group-open:rotate-90" />
              </summary>
              <p className="mt-3 text-sm text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-4 py-20">
        <div className="glass-strong relative overflow-hidden rounded-3xl p-10 text-center">
          <div className="absolute -top-24 left-1/2 h-64 w-[600px] -translate-x-1/2 rounded-full bg-primary/40 blur-3xl" />
          <div className="relative">
            <Rocket className="mx-auto h-8 w-8 text-primary" />
            <h3 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Stay organized. <span className="gradient-text">Ship your career.</span>
            </h3>
            <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground">
              Join thousands of candidates using Placement Tracker Pro to run a smarter job hunt.
            </p>
            <Link
              to="/auth"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-secondary px-5 py-3 text-sm font-semibold text-white glow-primary"
            >
              Start Tracking — it's free <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mx-auto max-w-6xl px-4 pb-12">
        <div className="flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-6 text-xs text-muted-foreground sm:flex-row">
          <div className="flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5" />
            <span>© {new Date().getFullYear()} Placement Tracker Pro</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-foreground"><Twitter className="h-4 w-4" /></a>
            <a href="#" className="hover:text-foreground"><Github className="h-4 w-4" /></a>
            <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Built with love</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
