import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3,
  Bell,
  Briefcase,
  Building2,
  Calendar,
  ChevronsLeft,
  ChevronsRight,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Search,
  Settings,
  Sparkles,
  Sun,
  User as UserIcon,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTheme } from "./ThemeProvider";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/applications", label: "Applications", icon: Briefcase },
  { to: "/companies", label: "Companies", icon: Building2 },
  { to: "/calendar", label: "Calendar", icon: Calendar },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/resume", label: "Resume", icon: FileText },
  { to: "/profile", label: "Profile", icon: UserIcon },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="relative flex min-h-screen">
      {/* Desktop sidebar */}
      <aside
        className={`sticky top-0 hidden h-screen shrink-0 md:block transition-[width] duration-300 ${collapsed ? "w-[76px]" : "w-64"}`}
      >
        <SidebarInner collapsed={collapsed} pathname={pathname} onToggle={() => setCollapsed((v) => !v)} />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-background/60 backdrop-blur md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -320 }} animate={{ x: 0 }} exit={{ x: -320 }}
              transition={{ type: "spring", stiffness: 260, damping: 30 }}
              className="fixed inset-y-0 left-0 z-50 w-64 md:hidden"
            >
              <SidebarInner collapsed={false} pathname={pathname} onToggle={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <TopNavbar onOpenMobile={() => setMobileOpen(true)} />
        <main className="min-w-0 flex-1 px-4 pb-16 pt-6 sm:px-6 lg:px-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 8, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -8, filter: "blur(6px)" }}
              transition={{ duration: 0.35 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

function SidebarInner({
  collapsed, pathname, onToggle,
}: {
  collapsed: boolean;
  pathname: string;
  onToggle: () => void;
}) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const signOut = async () => {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };
  return (
    <div className="glass-strong m-3 flex h-[calc(100vh-1.5rem)] flex-col rounded-2xl p-3">
      <div className="flex items-center justify-between px-1 py-2">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-primary to-secondary">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          {!collapsed && <span className="truncate text-sm font-semibold">Placement Pro</span>}
        </Link>
        <button
          onClick={onToggle}
          className="hidden rounded-md p-1 text-muted-foreground hover:bg-sidebar-accent hover:text-foreground md:inline-flex"
          aria-label="Toggle sidebar"
        >
          {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
        </button>
      </div>

      <nav className="mt-4 flex-1 space-y-1 overflow-y-auto">
        {NAV.map((item) => {
          const active = pathname === item.to || pathname.startsWith(item.to + "/");
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`group relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${
                active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {active && (
                <motion.div
                  layoutId="side-active"
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/25 to-secondary/15 ring-1 ring-primary/40"
                  transition={{ type: "spring", stiffness: 300, damping: 26 }}
                />
              )}
              <item.icon className="relative z-10 h-4 w-4 shrink-0" />
              {!collapsed && <span className="relative z-10 truncate">{item.label}</span>}
              {active && !collapsed && (
                <span className="relative z-10 ml-auto h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_10px_theme(colors.primary)]" />
              )}
            </Link>
          );
        })}
      </nav>

      <button
        onClick={signOut}
        className="mt-2 flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-muted-foreground transition hover:bg-sidebar-accent hover:text-destructive"
      >
        <LogOut className="h-4 w-4" />
        {!collapsed && "Sign out"}
      </button>
    </div>
  );
}

function TopNavbar({ onOpenMobile }: { onOpenMobile: () => void }) {
  const { theme, toggle } = useTheme();
  const { user } = useAuth();
  const [notifOpen, setNotifOpen] = useState(false);
  const initial = (user?.user_metadata?.full_name || user?.email || "?").toString().slice(0, 1).toUpperCase();

  useEffect(() => {
    const close = () => setNotifOpen(false);
    if (notifOpen) window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [notifOpen]);

  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/60 backdrop-blur">
      <div className="flex h-14 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button className="md:hidden" onClick={onOpenMobile}><Menu className="h-5 w-5" /></button>
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            placeholder="Search applications, companies…"
            className="w-full rounded-xl border border-border bg-card/50 py-2 pl-9 pr-3 text-sm outline-none ring-primary/30 focus:ring-2"
          />
        </div>
        <div className="ml-auto flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); setNotifOpen((v) => !v); }}
            className="relative rounded-lg p-2 text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-accent" />
          </button>
          {notifOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}
              className="glass absolute right-16 top-14 w-80 rounded-xl p-3"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-2 text-sm font-semibold">Notifications</div>
              <div className="space-y-1.5 text-xs text-muted-foreground">
                <div className="rounded-lg bg-card/60 p-2">Welcome to Placement Tracker Pro 👋</div>
                <div className="rounded-lg bg-card/60 p-2">Tip: Add your first application from the dashboard.</div>
              </div>
            </motion.div>
          )}
          <button
            onClick={toggle}
            className="rounded-lg p-2 text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <div className="ml-2 grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-primary to-secondary text-xs font-bold text-white">
            {initial}
          </div>
        </div>
      </div>
    </header>
  );
}
