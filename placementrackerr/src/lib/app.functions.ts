import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const ApplicationInput = z.object({
  company_name: z.string().trim().min(1).max(120),
  role: z.string().trim().min(1).max(160),
  location: z.string().trim().max(120).optional().nullable(),
  salary: z.string().trim().max(60).optional().nullable(),
  package: z.string().trim().max(60).optional().nullable(),
  work_mode: z.enum(["onsite", "remote", "hybrid"]).optional().nullable(),
  applied_at: z.string().optional().nullable(),
  deadline: z.string().optional().nullable(),
  status: z.enum(["applied", "review", "interview", "selected", "rejected", "offer"]).optional().nullable(),
  priority: z.enum(["low", "medium", "high"]).optional().nullable(),
  tags: z.array(z.string()).optional().nullable(),
  notes: z.string().max(4000).optional().nullable(),
});

export const listApplications = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("applications")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const createApplication = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => ApplicationInput.parse(d))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("applications")
      .insert({ ...(data as any), user_id: context.userId } as any)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const updateApplication = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid(), patch: ApplicationInput.partial() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("applications")
      .update(data.patch as any)
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteApplication = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("applications").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listCompanies = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("companies")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

const CompanyInput = z.object({
  name: z.string().trim().min(1).max(120),
  logo_url: z.string().max(500).optional().nullable(),
  website: z.string().max(300).optional().nullable(),
  location: z.string().max(120).optional().nullable(),
  industry: z.string().max(120).optional().nullable(),
  description: z.string().max(2000).optional().nullable(),
  package_range: z.string().max(60).optional().nullable(),
});

export const createCompany = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => CompanyInput.parse(d))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("companies")
      .insert({ ...data, user_id: context.userId })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const getProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("profiles")
      .select("*")
      .eq("id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data;
  });

const ProfileInput = z.object({
  full_name: z.string().trim().max(120).optional().nullable(),
  headline: z.string().trim().max(160).optional().nullable(),
  avatar_url: z.string().max(500).optional().nullable(),
  skills: z.array(z.string()).optional().nullable(),
  socials: z.record(z.string(), z.string()).optional().nullable(),
  education: z.array(z.any()).optional().nullable(),
  settings: z.record(z.string(), z.any()).optional().nullable(),
});

export const updateProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => ProfileInput.parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("profiles")
      .update(data)
      .eq("id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listResumes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("resumes")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const registerResume = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    name: z.string().min(1).max(200),
    file_path: z.string().min(1).max(500),
    size_bytes: z.number().int().nonnegative().optional(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    // Determine version
    const { data: existing } = await context.supabase
      .from("resumes")
      .select("version")
      .eq("user_id", context.userId)
      .order("version", { ascending: false })
      .limit(1);
    const nextVersion = (existing?.[0]?.version ?? 0) + 1;
    // Deactivate previous actives
    await context.supabase.from("resumes").update({ is_active: false }).eq("user_id", context.userId);
    const { data: row, error } = await context.supabase
      .from("resumes")
      .insert({
        user_id: context.userId,
        name: data.name,
        file_path: data.file_path,
        size_bytes: data.size_bytes,
        version: nextVersion,
        is_active: true,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const deleteResume = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid(), file_path: z.string() }).parse(d))
  .handler(async ({ data, context }) => {
    await context.supabase.storage.from("resumes").remove([data.file_path]);
    const { error } = await context.supabase.from("resumes").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listEvents = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.from("events").select("*").order("date", { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  });
