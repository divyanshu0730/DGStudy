import { requireAdmin } from "@/lib/supabase/guards";
import {
  createSubject,
  deleteSubject,
  createChapter,
  deleteChapter,
  uploadNote,
  replaceNoteFile,
  togglePublish,
  deleteNote
} from "@/app/admin/actions";

export default async function AdminContentPage({
  searchParams
}: {
  searchParams: { branch?: string; semester?: string; subject?: string };
}) {
  const { supabase } = await requireAdmin();

  const { data: branches } = await supabase.from("branches").select("id, name, slug").order("order_index");
  const branchId = searchParams.branch || branches?.[0]?.id;

  const { data: semesters } = branchId
    ? await supabase.from("semesters").select("id, semester_number").eq("branch_id", branchId).order("semester_number")
    : { data: [] };
  const semesterId = searchParams.semester || semesters?.[0]?.id;

  const { data: subjects } = semesterId
    ? await supabase.from("subjects").select("id, name, slug, subject_code").eq("semester_id", semesterId).order("order_index")
    : { data: [] };
  const subjectId = searchParams.subject || subjects?.[0]?.id;

  const { data: chapters, error: chaptersError } = subjectId
  ? await supabase
      .from("chapters")
      .select("id, name, slug, notes(id, title, published, file_size, version)")
      .eq("subject_id", subjectId)
      .order("order_index")
  : { data: [], error: null };

if (chaptersError) {
  console.error("LOAD CHAPTERS FAILED:", chaptersError);
}

  const qs = (overrides: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    const merged = { branch: branchId, semester: semesterId, subject: subjectId, ...overrides };
    Object.entries(merged).forEach(([k, v]) => v && p.set(k, v));
    return `?${p.toString()}`;
  };

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-900">Subjects, Chapters &amp; Notes</h1>

      {/* Branch / semester / subject selectors as plain links (works without client JS) */}
      <div className="mt-4 flex flex-wrap gap-2">
        {(branches || []).map((b) => (
          <a
            key={b.id}
            href={qs({ branch: b.id, semester: undefined, subject: undefined })}
            className={`rounded-full px-3 py-1 text-xs font-medium ${b.id === branchId ? "bg-brand-600 text-white" : "bg-white border border-slate-200 text-slate-600"}`}
          >
            {b.name}
          </a>
        ))}
        {(!branches || branches.length === 0) && (
          <p className="text-sm text-slate-500">
            No branches yet — add one on the <a href="/admin/branches" className="text-brand-700 underline">Branches</a> page first.
          </p>
        )}
      </div>

      {branchId && (
        <div className="mt-2 flex flex-wrap gap-2">
          {(semesters || []).map((s) => (
            <a
              key={s.id}
              href={qs({ semester: s.id, subject: undefined })}
              className={`rounded-full px-3 py-1 text-xs font-medium ${s.id === semesterId ? "bg-brand-600 text-white" : "bg-white border border-slate-200 text-slate-600"}`}
            >
              Sem {s.semester_number}
            </a>
          ))}
        </div>
      )}

      {semesterId && (
        <>
          <form action={createSubject} className="card mt-4 flex flex-wrap gap-2 p-4">
            <input type="hidden" name="semester_id" value={semesterId} />
            <input name="name" placeholder="New subject name" className="input flex-1 min-w-[140px]" required />
            <input name="subject_code" placeholder="Code (optional)" className="input w-32" />
            <button className="btn-primary shrink-0">Add subject</button>
          </form>

          <div className="mt-3 flex flex-wrap gap-2">
            {(subjects || []).map((sub) => (
              <div key={sub.id} className="flex items-center gap-1">
                <a
                  href={qs({ subject: sub.id })}
                  className={`rounded-full px-3 py-1 text-xs font-medium ${sub.id === subjectId ? "bg-brand-600 text-white" : "bg-white border border-slate-200 text-slate-600"}`}
                >
                  {sub.name}
                </a>
                <form action={deleteSubject.bind(null, sub.id)}>
                  <button className="text-xs text-red-500" title="Delete subject">✕</button>
                </form>
              </div>
            ))}
          </div>
        </>
      )}

      {subjectId && (
        <>
          <form action={createChapter} className="card mt-4 flex gap-2 p-4">
            <input type="hidden" name="subject_id" value={subjectId} />
            <input name="name" placeholder="New chapter name" className="input" required />
            <button className="btn-primary shrink-0">Add chapter</button>
          </form>

          <div className="mt-4 space-y-4">
            {(chapters || []).map((ch: any) => (
              <div key={ch.id} className="card p-4">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-slate-900">{ch.name}</div>
                  <form action={deleteChapter.bind(null, ch.id)}>
                    <button className="text-xs text-red-600">Delete chapter</button>
                  </form>
                </div>

                <form action={uploadNote} className="mt-3 flex flex-wrap items-center gap-2 rounded-xl bg-slate-50 p-3">
                  <input type="hidden" name="chapter_id" value={ch.id} />
                  <input name="title" placeholder="Note title" className="input flex-1 min-w-[140px]" required />
                  <input type="file" name="file" accept="application/pdf" required className="text-xs" />
                  <button className="btn-secondary text-xs">Upload PDF</button>
                </form>

                <div className="mt-3 space-y-2">
                  {(ch.notes || [])
                    .slice()
                    .sort((a: any, b: any) => b.version - a.version)
                    .map((n: any) => (
                      <div key={n.id} className="flex flex-col gap-2 rounded-xl border border-slate-200 p-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium text-slate-900">
                            {n.title} <span className="text-xs text-slate-400">v{n.version}</span>
                          </div>
                          <div className="text-xs text-slate-500">
                            {n.published ? "Published" : "Draft"} · {n.file_size ? `${Math.round(n.file_size / 1024)} KB` : ""}
                          </div>
                        </div>
                        <div className="flex shrink-0 flex-wrap items-center gap-2">
                          <form
                            action={replaceNoteFile.bind(null, n.id)}
                            className="flex items-center gap-1"
                            title="Replace this PDF with a new version"
                          >
                            <input
                              type="file"
                              name="file"
                              accept="application/pdf"
                              required
                              className="w-28 text-[11px]"
                            />
                            <button className="btn-secondary text-xs">Replace</button>
                          </form>
                          <form action={togglePublish.bind(null, n.id, n.published)}>
                            <button className="btn-secondary text-xs">
                              {n.published ? "Unpublish" : "Publish"}
                            </button>
                          </form>
                          <form action={deleteNote.bind(null, n.id)}>
                            <button className="text-xs text-red-600">Delete</button>
                          </form>
                        </div>
                      </div>
                    ))}
                  {(!ch.notes || ch.notes.length === 0) && (
                    <p className="text-xs text-slate-400">No notes uploaded yet.</p>
                  )}
                </div>
              </div>
            ))}
            {(!chapters || chapters.length === 0) && (
              <p className="card p-4 text-sm text-slate-500">No chapters yet — add one above.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
