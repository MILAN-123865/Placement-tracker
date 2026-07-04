import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { deleteResume, listResumes, registerResume } from "@/lib/app.functions";
import { motion } from "framer-motion";
import { CheckCircle2, Download, FileText, Loader2, Trash2, UploadCloud } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/resume")({
  head: () => ({ meta: [{ title: "Resume — Placement Tracker Pro" }] }),
  component: ResumePage,
});

function ResumePage() {
  const list = useServerFn(listResumes);
  const register = useServerFn(registerResume);
  const del = useServerFn(deleteResume);
  const qc = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const { data: resumes = [] } = useQuery({ queryKey: ["resumes"], queryFn: () => list() });

  const upload = async (file: File) => {
    setUploading(true);
    try {
      const { data: session } = await supabase.auth.getUser();
      if (!session.user) throw new Error("Not signed in");
      const path = `${session.user.id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const { error } = await supabase.storage.from("resumes").upload(path, file, { upsert: false });
      if (error) throw error;
      await register({ data: { name: file.name, file_path: path, size_bytes: file.size } });
      qc.invalidateQueries({ queryKey: ["resumes"] });
      toast.success("Resume uploaded");
    } catch (e: any) {
      toast.error(e.message ?? "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const download = async (path: string) => {
    const { data, error } = await supabase.storage.from("resumes").createSignedUrl(path, 300);
    if (error) return toast.error("Failed to create link");
    window.open(data.signedUrl, "_blank");
  };

  const delMut = useMutation({
    mutationFn: (v: { id: string; file_path: string }) => del({ data: v }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["resumes"] }); toast.success("Deleted"); },
  });

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Resume</h1>
        <p className="text-sm text-muted-foreground">Upload multiple versions and pick the active one.</p>
      </div>

      <motion.div
        whileHover={{ scale: 1.005 }}
        onClick={() => inputRef.current?.click()}
        className="glass grid cursor-pointer place-items-center rounded-2xl border-2 border-dashed border-border/70 p-10 text-center transition hover:border-primary/60"
      >
        <UploadCloud className="mb-2 h-10 w-10 text-primary" />
        <div className="text-sm font-medium">Drop your resume or click to browse</div>
        <div className="mt-1 text-xs text-muted-foreground">PDF, DOCX up to 10 MB</div>
        <input
          ref={inputRef}
          type="file" accept=".pdf,.doc,.docx"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); }}
        />
        {uploading && <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground"><Loader2 className="h-3 w-3 animate-spin" /> Uploading…</div>}
      </motion.div>

      <div className="space-y-2">
        <div className="text-sm font-semibold">Version history</div>
        {resumes.length === 0 && <div className="glass grid h-32 place-items-center rounded-2xl text-sm text-muted-foreground">No resumes uploaded yet.</div>}
        {resumes.map((r) => (
          <motion.div key={r.id} layout className="glass flex items-center gap-3 rounded-xl p-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br from-primary/30 to-secondary/30">
              <FileText className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <div className="truncate text-sm font-medium">{r.name}</div>
                {r.is_active && <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-[10px] text-success"><CheckCircle2 className="h-3 w-3" /> Active</span>}
              </div>
              <div className="text-xs text-muted-foreground">v{r.version} • {r.created_at ? new Date(r.created_at).toLocaleDateString() : ""}</div>
            </div>
            <button onClick={() => download(r.file_path)} className="rounded-md p-2 text-muted-foreground hover:text-foreground"><Download className="h-4 w-4" /></button>
            <button onClick={() => delMut.mutate({ id: r.id, file_path: r.file_path })} className="rounded-md p-2 text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
