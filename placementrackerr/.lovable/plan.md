
# Placement Tracker Pro — Build Plan

Premium dark-first SaaS to track job applications. Landing + full authenticated app, real backend via Lovable Cloud.

## Design System

- **Palette (dark)**: bg `#030712`, surface `#0F172A`, glass `rgba(255,255,255,0.05)`, primary `#6366F1`, secondary `#22D3EE`, accent `#F97316`, success `#22C55E`, warning `#F59E0B`, danger `#EF4444`, text `#FFFFFF`, muted `#94A3B8`. Light mode inverts surfaces, keeps accents. Toggle in navbar + settings, persisted.
- **Type**: Inter (`@fontsource-variable/inter`). Large bold display headings, tight tracking.
- **Motion (Framer Motion)**: page fade/slide, card hover-lift + glow, button glow, counter-up stats, animated charts, skeletons, toast slide, sidebar slide, animated navbar underline.
- **Animated background** (global fixed layer): gradient mesh + 3 blurred drifting orbs, particle canvas with constellation lines, mouse parallax, slow radial gradient sweep, noise overlay.
- Tokens in `src/styles.css` (`@theme inline` + `:root` / `.dark`). No hardcoded hex in components.

## Backend (Lovable Cloud)

Auth: email/password + Google. Private storage bucket `resumes` with per-user folder RLS.

**Tables** (RLS scoped to `auth.uid()`; grants to `authenticated` + `service_role`):
- `profiles` (auto-trigger on signup) — name, avatar, headline, skills, education, socials, settings.
- `companies` — name, logo, website, location, industry, description, package_range.
- `applications` — company, role, location, salary, package, work_mode, applied_at, deadline, status enum, priority enum, tags, notes, resume_id.
- `resumes` — name, file_path, version, is_active.
- `events` — application_id, title, date, type.
- `notifications` — title, body, read.
- `user_roles` + `app_role` enum + `has_role()` SECURITY DEFINER (separate table, never on profiles).

## Routes

Public:
- `/` — Landing (sticky navbar, hero + floating dashboard preview, trusted-by, feature cards, stats, product showcase, testimonials, FAQ, footer).
- `/auth` — login/register/forgot tabs, glass card, animated blobs, Google button.

`_authenticated/` (managed layout, `ssr:false`):
- `/dashboard` — 6 stat cards with counter-up; area/pie/bar charts; timeline, activity feed, upcoming deadlines, quick actions, mini calendar, notifications.
- `/applications` — data table (search, filter, sort, pagination, status/priority badges, tags, bulk actions) + Add modal (rhf + zod).
- `/companies` — glass card grid.
- `/resume` — upload/preview/version history/download/delete/replace.
- `/calendar` — month view with deadlines/events.
- `/analytics` — apps/month, status dist, offer ratio, success %, top companies/locations, response time.
- `/profile`, `/settings`, 404.

Shell: collapsible glass sidebar + top navbar (search, notifications, theme toggle, profile menu). Mobile sidebar as sheet. Sonner toasts. Skeletons/empty/error states.

## Tech

React 19 + TanStack Start, TS, Tailwind v4, shadcn/ui, Framer Motion, TanStack Query, react-hook-form + zod, Recharts, lucide-react, date-fns, sonner. Server functions in `src/lib/*.functions.ts` with `requireSupabaseAuth`.

## Build Order

1. Enable Lovable Cloud; configure Google social auth.
2. Migrations: enums, tables, RLS, grants, `handle_new_user` trigger, `user_roles` + `has_role()`; create private `resumes` bucket + object RLS.
3. Install fonts + deps; rewrite `src/styles.css` with dark + light tokens and utilities.
4. Theme provider + global `AnimatedBackground` + `AppShell` + `PageTransition`.
5. Landing page.
6. `/auth` route.
7. Dashboard with real data + charts.
8. Applications table + Add modal (CRUD server fns).
9. Companies, Resume, Calendar, Analytics.
10. Profile, Settings.
11. 404, empty/loading/error, toasts.
12. Polish: hover glows, focus rings, responsive, a11y, per-route head metadata.

## Notes

- No `og:image` on `__root.tsx`; per-leaf where meaningful.
- Public routes never call auth-protected server fns from loaders.
- Service-role imports only inside handler bodies via `await import`.
- Real app title/description in root `head()`.
