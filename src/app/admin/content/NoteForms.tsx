"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  prepareNoteUpload,
  saveUploadedNote,
  prepareReplaceUpload,
  finishReplaceNote,
} from "@/app/admin/actions";

const MAX_PDF_BYTES = 50 * 1024 * 1024;

type Message = { type: "ok" | "error"; text: string } | null;

function isPdf(file: File) {
  return (
    file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")
  );
}

export function NoteUploadForm({ chapterId }: { chapterId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<Message>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    const title = String(data.get("title") || "").trim();
    const description = String(data.get("description") || "").trim();
    const file = data.get("file") as File | null;

    if (!title) {
      setMessage({ type: "error", text: "Please enter a note title." });
      return;
    }
    if (!file || file.size === 0) {
      setMessage({ type: "error", text: "Please choose a PDF file." });
      return;
    }
    if (!isPdf(file)) {
      setMessage({ type: "error", text: "Only PDF files are allowed." });
      return;
    }
    if (file.size > MAX_PDF_BYTES) {
      setMessage({ type: "error", text: "PDF must be 50 MB or smaller." });
      return;
    }

    setBusy(true);
    setMessage(null);

    try {
      const prep = await prepareNoteUpload(chapterId, title);
      if (!prep.ok) throw new Error(prep.error);

      const supabase = createClient();
      const { error: uploadError } = await supabase.storage
        .from("pdfs")
        .uploadToSignedUrl(prep.path, prep.token, file, {
          contentType: "application/pdf",
        });
      if (uploadError) throw new Error(uploadError.message);

      const saved = await saveUploadedNote({
        chapterId,
        title,
        description,
        path: prep.path,
        size: file.size,
        version: prep.version,
      });
      if (!saved.ok) throw new Error(saved.error);

      form.reset();
      setMessage({ type: "ok", text: "PDF uploaded. It is saved as Draft." });
      router.refresh();
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Upload failed.",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-3 flex flex-col gap-3 rounded-xl bg-slate-50 p-3"
    >
      <input
        name="title"
        placeholder="Note title"
        className="input w-full"
        required
      />

      <textarea
        name="description"
        placeholder="PDF Notes SEO description (optional)"
        className="input min-h-20 w-full"
        rows={3}
      />

      <input
        type="file"
        name="file"
        accept="application/pdf"
        required
        className="text-xs"
      />

      <button
        type="submit"
        disabled={busy}
        className="btn-secondary self-start text-xs disabled:opacity-60"
      >
        {busy ? "Uploading…" : "Upload PDF"}
      </button>

      {message && (
        <p
          className={`text-xs ${
            message.type === "ok" ? "text-green-700" : "text-red-600"
          }`}
        >
          {message.text}
        </p>
      )}
    </form>
  );
}

export function ReplaceNoteForm({ noteId }: { noteId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<Message>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const file = new FormData(form).get("file") as File | null;

    if (!file || file.size === 0) {
      setMessage({ type: "error", text: "Choose a PDF first." });
      return;
    }
    if (!isPdf(file)) {
      setMessage({ type: "error", text: "Only PDF files are allowed." });
      return;
    }
    if (file.size > MAX_PDF_BYTES) {
      setMessage({ type: "error", text: "PDF must be 50 MB or smaller." });
      return;
    }

    setBusy(true);
    setMessage(null);

    try {
      const prep = await prepareReplaceUpload(noteId);
      if (!prep.ok) throw new Error(prep.error);

      const supabase = createClient();
      const { error: uploadError } = await supabase.storage
        .from("pdfs")
        .uploadToSignedUrl(prep.path, prep.token, file, {
          contentType: "application/pdf",
        });
      if (uploadError) throw new Error(uploadError.message);

      const done = await finishReplaceNote(noteId, prep.path, file.size);
      if (!done.ok) throw new Error(done.error);

      form.reset();
      setMessage({ type: "ok", text: "PDF replaced." });
      router.refresh();
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Replace failed.",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-1"
      title="Replace this PDF with a new version"
    >
      <div className="flex items-center gap-1">
        <input
          type="file"
          name="file"
          accept="application/pdf"
          required
          className="w-28 text-[11px]"
        />
        <button
          type="submit"
          disabled={busy}
          className="btn-secondary text-xs disabled:opacity-60"
        >
          {busy ? "Replacing…" : "Replace"}
        </button>
      </div>

      {message && (
        <p
          className={`text-[11px] ${
            message.type === "ok" ? "text-green-700" : "text-red-600"
          }`}
        >
          {message.text}
        </p>
      )}
    </form>
  );
}
export function DescriptionEditor({
  action,
  initialValue,
  placeholder,
  buttonLabel,
}: {
  action: (formData: FormData) => Promise<void>;
  initialValue: string;
  placeholder: string;
  buttonLabel: string;
}) {
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setStatus("idle");

    startTransition(async () => {
      try {
        await action(data);
        setStatus("saved");
      } catch {
        setStatus("error");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="mt-2 flex flex-col gap-2">
      <textarea
        name="description"
        defaultValue={initialValue}
        placeholder={placeholder}
        className="input min-h-20 w-full"
        rows={3}
      />

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="btn-secondary self-start text-xs disabled:opacity-60"
        >
          {pending ? "Saving…" : buttonLabel}
        </button>

        {status === "saved" && (
          <span className="text-xs text-green-700">Saved ✓</span>
        )}
        {status === "error" && (
          <span className="text-xs text-red-600">
            Could not save. Try again.
          </span>
        )}
      </div>
    </form>
  );
}