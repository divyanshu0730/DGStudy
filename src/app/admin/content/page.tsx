
import { requireAdmin } from "@/lib/supabase/guards";
import {
  createSubject,
  deleteSubject,
  createChapter,
  deleteChapter,
  uploadNote,
  replaceNoteFile,
  togglePublish,
  deleteNote,
} from "@/app/admin/actions";

export default async function AdminContentPage({
  searchParams,
}: {
  searchParams: { branch?: string; semester?: string; subject?: string };
}) {
  const { supabase } = await requireAdmin();

  const { data: branches, error: branchesError } = await supabase
    .from("branches")
    .select("id, name, slug")
    .order("order_index");

  if (branchesError) {
    console.error("LOAD BRANCHES FAILED:", branchesError);
  }

  const branchId = searchParams.branch || branches?.[0]?.id;

  const { data: semesters, error: semestersError } = branchId
    ? await supabase
        .from("semesters")
        .select("id, semester_number")
        .eq("branch_id", branchId)
        .order("semester_number")
    : { data: [], error: null };

  if (semestersError) {
    console.error("LOAD SEMESTERS FAILED:", semestersError);
  }

  const semesterId = searchParams.semester || semesters?.[0]?.id;

  const { data: subjects, error: subjectsError } = semesterId
    ? await supabase
        .from("subjects")
        .select("id, name, slug, subject_code, description")
        .eq("semester_id", semesterId)
        .order("order_index")
    : { data: [], error: null };

  if (subjectsError) {
    console.error("LOAD SUBJECTS FAILED:", subjectsError);
  }

  const subjectId = searchParams.subject || subjects?.[0]?.id;

  const { data: chapters, error: chaptersError } = subjectId
    ? await supabase
        .from("chapters")
        .select(
          "id, name, slug, description, notes(id, title, description, published, file_size, version)"
        )
        .eq("subject_id", subjectId)
        .order("order_index")
    : { data: [], error: null };

  if (chaptersError) {
    console.error("LOAD CHAPTERS FAILED:", chaptersError);
  }

  const qs = (overrides: Record<string, string | undefined>) => {
    const p = new URLSearchParams();

    const merged = {
      branch: branchId,
      semester: semesterId,
      subject: subjectId,
      ...overrides,
    };

    Object.entries(merged).forEach(([key, value]) => {
      if (value) p.set(key, value);
    });

    return `?${p.toString()}`;
  };

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-900">
        Subjects, Chapters &amp; Notes
      </h1>

      {/* Branch selector */}
      <div className="mt-4 flex flex-wrap gap-2">
        {(branches || []).map((branch) => (
          <a
            key={branch.id}
            href={qs({
              branch: branch.id,
              semester: undefined,
              subject: undefined,
            })}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              branch.id === branchId
                ? "bg-brand-600 text-white"
                : "border border-slate-200 bg-white text-slate-600"
            }`}
          >
            {branch.name}
          </a>
        ))}

        {(!branches || branches.length === 0) && (
          <p className="text-sm text-slate-500">
            No branches yet — add one on the{" "}
            <a
              href="/admin/branches"
              className="text-brand-700 underline"
            >
              Branches
            </a>{" "}
            page first.
          </p>
        )}
      </div>

      {/* Semester selector */}
      {branchId && (
        <div className="mt-2 flex flex-wrap gap-2">
          {(semesters || []).map((semester) => (
            <a
              key={semester.id}
              href={qs({
                semester: semester.id,
                subject: undefined,
              })}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                semester.id === semesterId
                  ? "bg-brand-600 text-white"
                  : "border border-slate-200 bg-white text-slate-600"
              }`}
            >
              Sem {semester.semester_number}
            </a>
          ))}
        </div>
      )}

      {/* Subject creation and selector */}
      {semesterId && (
        <>
          <form
            action={createSubject}
            className="card mt-4 flex flex-col gap-3 p-4"
          >
            <input
              type="hidden"
              name="semester_id"
              value={semesterId}
            />

            <input
              name="name"
              placeholder="New subject name"
              className="input w-full"
              required
            />

            <input
              name="subject_code"
              placeholder="Subject code (optional)"
              className="input w-full"
            />

            <textarea
              name="description"
              placeholder="Subject SEO description (optional)"
              className="input min-h-20 w-full"
              rows={3}
            />

            <button className="btn-primary self-start">
              Add subject
            </button>
          </form>

          <div className="mt-3 flex flex-wrap gap-2">
            {(subjects || []).map((subject) => (
              <div
                key={subject.id}
                className="flex items-center gap-1"
              >
                <a
                  href={qs({ subject: subject.id })}
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    subject.id === subjectId
                      ? "bg-brand-600 text-white"
                      : "border border-slate-200 bg-white text-slate-600"
                  }`}
                >
                  {subject.name}
                </a>

                <form action={deleteSubject.bind(null, subject.id)}>
                  <button
                    className="text-xs text-red-500"
                    title="Delete subject"
                  >
                    ✕
                  </button>
                </form>
              </div>
            ))}
          </div>

          {subjects?.find((subject) => subject.id === subjectId)
            ?.description && (
            <p className="mt-2 text-sm text-slate-500">
              Subject description:{" "}
              {
                subjects.find((subject) => subject.id === subjectId)
                  ?.description
              }
            </p>
          )}
        </>
      )}

      {/* Chapter creation and notes */}
      {subjectId && (
        <>
          <form
            action={createChapter}
            className="card mt-4 flex flex-col gap-3 p-4"
          >
            <h2 className="font-semibold text-slate-900">
              Add Chapter
            </h2>

            <input
              type="hidden"
              name="subject_id"
              value={subjectId}
            />

            <input
              name="name"
              placeholder="New chapter name"
              className="input w-full"
              required
            />

            <textarea
              name="description"
              placeholder="Chapter SEO description (optional)"
              className="input min-h-20 w-full"
              rows={3}
            />

            <button className="btn-primary self-start">
              Add chapter
            </button>
          </form>

          <div className="mt-4 space-y-4">
            {(chapters || []).map((chapter: any) => (
              <div key={chapter.id} className="card p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-semibold text-slate-900">
                    {chapter.name}
                  </div>

                  <form action={deleteChapter.bind(null, chapter.id)}>
                    <button className="text-xs text-red-600">
                      Delete chapter
                    </button>
                  </form>
                </div>

                {chapter.description && (
                  <p className="mt-2 text-sm text-slate-500">
                    Chapter description: {chapter.description}
                  </p>
                )}

                {/* PDF upload with SEO description */}
                <form
                  action={uploadNote}
                  className="mt-3 flex flex-col gap-3 rounded-xl bg-slate-50 p-3"
                >
                  <input
                    type="hidden"
                    name="chapter_id"
                    value={chapter.id}
                  />

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

                  <button className="btn-secondary self-start text-xs">
                    Upload PDF
                  </button>
                </form>

                {/* Uploaded notes */}
                <div className="mt-3 space-y-2">
                  {(chapter.notes || [])
                    .slice()
                    .sort(
                      (a: any, b: any) => b.version - a.version
                    )
                    .map((note: any) => (
                      <div
                        key={note.id}
                        className="flex flex-col gap-2 rounded-xl border border-slate-200 p-3 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium text-slate-900">
                            {note.title}{" "}
                            <span className="text-xs text-slate-400">
                              v{note.version}
                            </span>
                          </div>

                          <div className="text-xs text-slate-500">
                            {note.published ? "Published" : "Draft"} ·{" "}
                            {note.file_size
                              ? `${Math.round(note.file_size / 1024)} KB`
                              : ""}
                          </div>

                          {note.description && (
                            <p className="mt-1 text-xs text-slate-500">
                              SEO description: {note.description}
                            </p>
                          )}
                        </div>

                        <div className="flex shrink-0 flex-wrap items-center gap-2">
                          <form
                            action={replaceNoteFile.bind(null, note.id)}
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

                            <button className="btn-secondary text-xs">
                              Replace
                            </button>
                          </form>

                          <form
                            action={togglePublish.bind(
                              null,
                              note.id,
                              note.published
                            )}
                          >
                            <button className="btn-secondary text-xs">
                              {note.published ? "Unpublish" : "Publish"}
                            </button>
                          </form>

                          <form action={deleteNote.bind(null, note.id)}>
                            <button className="text-xs text-red-600">
                              Delete
                            </button>
                          </form>
                        </div>
                      </div>
                    ))}

                  {(!chapter.notes || chapter.notes.length === 0) && (
                    <p className="text-xs text-slate-400">
                      No notes uploaded yet.
                    </p>
                  )}
                </div>
              </div>
            ))}

            {(!chapters || chapters.length === 0) && (
              <p className="card p-4 text-sm text-slate-500">
                No chapters yet — add one above.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
