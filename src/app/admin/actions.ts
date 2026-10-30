"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/supabase/guards";
import { createAdminClient } from "@/lib/supabase/admin";

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function ordinal(n: number) {
  if (n === 1) return "1st";
  if (n === 2) return "2nd";
  if (n === 3) return "3rd";
  return `${n}th`;
}

// ---------- Branches ----------
export async function createBranch(formData: FormData) {
  const { supabase } = await requireAdmin();

  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim();

  if (!name) return;

  const { data: branch, error } = await supabase
    .from("branches")
    .insert({
      name,
      slug: slugify(name),
      description: description || null,
      order_index: 0,
    })
    .select("id")
    .single();

  if (error) {
    console.error("CREATE BRANCH FAILED:", error);
    throw new Error(`Could not create branch: ${error.message}`);
  }

  // Automatically create all six semesters for a new branch.
  if (branch) {
    const rows = Array.from({ length: 6 }, (_, i) => ({
      branch_id: branch.id,
      semester_number: i + 1,
      name: `${ordinal(i + 1)} Semester`,
      slug: `${ordinal(i + 1)}-semester`,
    }));

    const { error: semesterError } = await supabase
      .from("semesters")
      .upsert(rows, { onConflict: "branch_id,semester_number" });

    if (semesterError) {
      console.error("CREATE SEMESTERS FAILED:", semesterError);
      throw new Error(
        `Branch created, but semesters could not be created: ${semesterError.message}`
      );
    }
  }

  revalidatePath("/admin/branches");
  revalidatePath("/branches");
}

export async function deleteBranch(branchId: string) {
  const { supabase } = await requireAdmin();

  const { error } = await supabase
    .from("branches")
    .delete()
    .eq("id", branchId);

  if (error) {
    console.error("DELETE BRANCH FAILED:", error);
    throw new Error(`Could not delete branch: ${error.message}`);
  }

  revalidatePath("/admin/branches");
  revalidatePath("/branches");
}

export async function ensureSemesters(branchId: string) {
  const { supabase } = await requireAdmin();

  const rows = Array.from({ length: 6 }, (_, i) => ({
    branch_id: branchId,
    semester_number: i + 1,
    name: `${ordinal(i + 1)} Semester`,
    slug: `${ordinal(i + 1)}-semester`,
  }));

  const { error } = await supabase
    .from("semesters")
    .upsert(rows, { onConflict: "branch_id,semester_number" });

  if (error) {
    console.error("ENSURE SEMESTERS FAILED:", error);
    throw new Error(`Could not create semesters: ${error.message}`);
  }

  revalidatePath("/admin/branches");
}

// ---------- Subjects ----------
export async function createSubject(formData: FormData) {
  const { supabase } = await requireAdmin();

  const semesterId = String(formData.get("semester_id") || "").trim();
  const name = String(formData.get("name") || "").trim();
  const subjectCode = String(formData.get("subject_code") || "").trim();
  const description = String(formData.get("description") || "").trim();

  if (!semesterId || !name) {
    throw new Error("Semester ID or subject name is missing.");
  }

  const { data, error } = await supabase
    .from("subjects")
    .insert({
      semester_id: semesterId,
      name,
      slug: slugify(name),
      subject_code: subjectCode || null,
      description: description || null,
      order_index: 0,
    })
    .select("id, name")
    .single();

  if (error) {
    console.error("CREATE SUBJECT FAILED:", error);
    throw new Error(`Could not create subject: ${error.message}`);
  }

  const { data: semester, error: semesterError } = await supabase
    .from("semesters")
    .select("branch_id")
    .eq("id", semesterId)
    .single();

  if (semesterError || !semester) {
    console.error("LOAD SEMESTER FAILED:", semesterError);
    throw new Error("Subject created, but semester could not be loaded.");
  }

  revalidatePath("/admin/content");
  revalidatePath("/admin/subjects");
  revalidatePath("/branches");

  redirect(
    `/admin/content?branch=${semester.branch_id}&semester=${semesterId}&subject=${data.id}`
  );
}

export async function deleteSubject(subjectId: string) {
  const { supabase } = await requireAdmin();

  const { error } = await supabase
    .from("subjects")
    .delete()
    .eq("id", subjectId);

  if (error) {
    console.error("DELETE SUBJECT FAILED:", error);
    throw new Error(`Could not delete subject: ${error.message}`);
  }

  revalidatePath("/admin/content");
  revalidatePath("/branches");
}

// ---------- Chapters ----------
export async function createChapter(formData: FormData) {
  const { supabase } = await requireAdmin();

  const subjectId = String(formData.get("subject_id") || "").trim();
  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim();

  if (!subjectId || !name) {
    throw new Error("Subject ID or chapter name is missing.");
  }

  const baseSlug = slugify(name);

  if (!baseSlug) {
    throw new Error("Please enter a valid chapter name.");
  }

  const { data: existing, error: existingError } = await supabase
    .from("chapters")
    .select("id, name")
    .eq("subject_id", subjectId)
    .eq("slug", baseSlug)
    .maybeSingle();

  if (existingError) {
    console.error("CHAPTER CHECK FAILED:", existingError);
    throw new Error("Could not check existing chapters.");
  }

  if (existing) {
    throw new Error(
      `A chapter with this name already exists: ${existing.name}`
    );
  }

  const { count, error: countError } = await supabase
    .from("chapters")
    .select("id", { count: "exact", head: true })
    .eq("subject_id", subjectId);

  if (countError) {
    console.error("CHAPTER COUNT FAILED:", countError);
    throw new Error(`Could not count chapters: ${countError.message}`);
  }

  const nextNumber = (count ?? 0) + 1;

  const { data, error } = await supabase
    .from("chapters")
    .insert({
      subject_id: subjectId,
      name,
      slug: baseSlug,
      description: description || null,
      chapter_number: nextNumber,
      order_index: nextNumber,
    })
    .select("id, name")
    .single();

  if (error) {
    console.error("CREATE CHAPTER FAILED:", error);

    if (error.code === "23505") {
      throw new Error(
        "This chapter already exists. Refresh the page and check the chapter list."
      );
    }

    throw new Error(`Could not create chapter: ${error.message}`);
  }

  console.log("CHAPTER CREATED:", data);

  revalidatePath("/admin/content");
  revalidatePath("/branches");
}

export async function deleteChapter(chapterId: string) {
  const { supabase } = await requireAdmin();

  const { error } = await supabase
    .from("chapters")
    .delete()
    .eq("id", chapterId);

  if (error) {
    console.error("DELETE CHAPTER FAILED:", error);
    throw new Error(`Could not delete chapter: ${error.message}`);
  }

  revalidatePath("/admin/content");
  revalidatePath("/branches");
}

// ---------- Notes (PDF upload / replace / publish) ----------
// PDFs are uploaded straight from the browser to Supabase Storage using a
// short-lived signed upload token. This avoids the server-action / Netlify
// request-size limit (413 error for PDFs of a few MB).

type PrepareUploadResult =
  | { ok: true; path: string; token: string; version: number }
  | { ok: false; error: string };

type SimpleResult = { ok: true } | { ok: false; error: string };

const MAX_PDF_BYTES = 50 * 1024 * 1024;

export async function prepareNoteUpload(
  chapterId: string,
  title: string
): Promise<PrepareUploadResult> {
  const { supabase } = await requireAdmin();

  const cleanTitle = title.trim();
  if (!chapterId || !cleanTitle) {
    return { ok: false, error: "Chapter or note title is missing." };
  }

  const { count, error: countError } = await supabase
    .from("notes")
    .select("id", { count: "exact", head: true })
    .eq("chapter_id", chapterId);

  if (countError) {
    console.error("NOTE COUNT FAILED:", countError);
    return { ok: false, error: `Could not count notes: ${countError.message}` };
  }

  const version = (count ?? 0) + 1;
  const path = `${chapterId}/v${version}-${Date.now()}-${slugify(cleanTitle) || "notes"}.pdf`;

  const admin = createAdminClient();
  const { data, error } = await admin.storage
    .from("pdfs")
    .createSignedUploadUrl(path);

  if (error || !data) {
    console.error("SIGNED UPLOAD URL FAILED:", error);
    return {
      ok: false,
      error: `Could not prepare upload: ${error?.message ?? "unknown error"}`,
    };
  }

  return { ok: true, path, token: data.token, version };
}

export async function saveUploadedNote(input: {
  chapterId: string;
  title: string;
  description: string;
  path: string;
  size: number;
  version: number;
}): Promise<SimpleResult> {
  const { supabase } = await requireAdmin();

  const title = input.title.trim();
  const description = input.description.trim();

  if (!input.chapterId || !title) {
    return { ok: false, error: "Chapter or note title is missing." };
  }

  if (
    !input.path.startsWith(`${input.chapterId}/`) ||
    !input.path.endsWith(".pdf")
  ) {
    return { ok: false, error: "Invalid file path." };
  }

  if (input.size <= 0 || input.size > MAX_PDF_BYTES) {
    return { ok: false, error: "File size must be between 1 byte and 50 MB." };
  }

  const { error: insertError } = await supabase.from("notes").insert({
    chapter_id: input.chapterId,
    title,
    description: description || null,
    storage_path: input.path,
    file_size: input.size,
    version: input.version,
    published: false,
  });

  if (insertError) {
    console.error("SAVE NOTE FAILED:", insertError);

    // Avoid leaving an orphaned PDF in storage if its database row fails.
    const admin = createAdminClient();
    await admin.storage.from("pdfs").remove([input.path]);

    return { ok: false, error: `Could not save note: ${insertError.message}` };
  }

  revalidatePath("/admin/content");
  revalidatePath("/branches");
  return { ok: true };
}

export async function prepareReplaceUpload(
  noteId: string
): Promise<PrepareUploadResult> {
  const { supabase } = await requireAdmin();

  const { data: note, error: noteError } = await supabase
    .from("notes")
    .select("chapter_id, title, version")
    .eq("id", noteId)
    .single();

  if (noteError || !note) {
    console.error("LOAD NOTE FAILED:", noteError);
    return { ok: false, error: "Could not find this note." };
  }

  const path = `${note.chapter_id}/v${note.version}-${Date.now()}-${slugify(note.title) || "notes"}.pdf`;

  const admin = createAdminClient();
  const { data, error } = await admin.storage
    .from("pdfs")
    .createSignedUploadUrl(path);

  if (error || !data) {
    console.error("SIGNED UPLOAD URL FAILED:", error);
    return {
      ok: false,
      error: `Could not prepare upload: ${error?.message ?? "unknown error"}`,
    };
  }

  return { ok: true, path, token: data.token, version: note.version };
}

export async function finishReplaceNote(
  noteId: string,
  newPath: string,
  size: number
): Promise<SimpleResult> {
  const { supabase } = await requireAdmin();

  const { data: note, error: noteError } = await supabase
    .from("notes")
    .select("chapter_id, storage_path")
    .eq("id", noteId)
    .single();

  if (noteError || !note) {
    console.error("LOAD NOTE FAILED:", noteError);
    return { ok: false, error: "Could not find this note." };
  }

  if (!newPath.startsWith(`${note.chapter_id}/`) || !newPath.endsWith(".pdf")) {
    return { ok: false, error: "Invalid file path." };
  }

  if (size <= 0 || size > MAX_PDF_BYTES) {
    return { ok: false, error: "File size must be between 1 byte and 50 MB." };
  }

  const { error: updateError } = await supabase
    .from("notes")
    .update({
      storage_path: newPath,
      file_size: size,
      updated_at: new Date().toISOString(),
    })
    .eq("id", noteId);

  if (updateError) {
    console.error("UPDATE NOTE FAILED:", updateError);
    const admin = createAdminClient();
    await admin.storage.from("pdfs").remove([newPath]);
    return {
      ok: false,
      error: `Could not update note: ${updateError.message}`,
    };
  }

  // Remove the old PDF only after the database points to the new one.
  if (note.storage_path && note.storage_path !== newPath) {
    const admin = createAdminClient();
    const { error: removeError } = await admin.storage
      .from("pdfs")
      .remove([note.storage_path]);
    if (removeError) {
      console.error("REMOVE OLD PDF FAILED:", removeError);
    }
  }

  revalidatePath("/admin/content");
  revalidatePath("/branches");
  return { ok: true };
}

export async function togglePublish(
  noteId: string,
  currentlyPublished: boolean
) {
  const { supabase } = await requireAdmin();

  const { error } = await supabase
    .from("notes")
    .update({ published: !currentlyPublished })
    .eq("id", noteId);

  if (error) {
    console.error("TOGGLE PUBLISH FAILED:", error);
    throw new Error(`Could not update publish status: ${error.message}`);
  }

  revalidatePath("/admin/content");
  revalidatePath("/branches");
}

export async function deleteNote(noteId: string) {
  const { supabase } = await requireAdmin();

  const { data: note, error: noteError } = await supabase
    .from("notes")
    .select("storage_path")
    .eq("id", noteId)
    .single();

  if (noteError) {
    console.error("LOAD NOTE FOR DELETE FAILED:", noteError);
    throw new Error(`Could not load note: ${noteError.message}`);
  }

  if (note) {
    const admin = createAdminClient();
    const { error: storageError } = await admin.storage
      .from("pdfs")
      .remove([note.storage_path]);

    if (storageError) {
      console.error("DELETE PDF FAILED:", storageError);
      throw new Error(`Could not delete PDF file: ${storageError.message}`);
    }
  }

  const { error } = await supabase
    .from("notes")
    .delete()
    .eq("id", noteId);

  if (error) {
    console.error("DELETE NOTE FAILED:", error);
    throw new Error(`Could not delete note: ${error.message}`);
  }

  revalidatePath("/admin/content");
  revalidatePath("/branches");
}

// ---------- Edit descriptions (existing rows) ----------
export async function updateSubjectDescription(
  subjectId: string,
  formData: FormData
) {
  const { supabase } = await requireAdmin();
  const description = String(formData.get("description") || "").trim();

  const { error } = await supabase
    .from("subjects")
    .update({ description: description || null })
    .eq("id", subjectId);

  if (error) {
    console.error("UPDATE SUBJECT DESCRIPTION FAILED:", error);
    throw new Error(`Could not update subject description: ${error.message}`);
  }

  revalidatePath("/admin/content");
  revalidatePath("/branches");
}

export async function updateChapterDescription(
  chapterId: string,
  formData: FormData
) {
  const { supabase } = await requireAdmin();
  const description = String(formData.get("description") || "").trim();

  const { error } = await supabase
    .from("chapters")
    .update({ description: description || null })
    .eq("id", chapterId);

  if (error) {
    console.error("UPDATE CHAPTER DESCRIPTION FAILED:", error);
    throw new Error(`Could not update chapter description: ${error.message}`);
  }

  revalidatePath("/admin/content");
  revalidatePath("/branches");
}

export async function updateNoteDescription(
  noteId: string,
  formData: FormData
) {
  const { supabase } = await requireAdmin();
  const description = String(formData.get("description") || "").trim();

  const { error } = await supabase
    .from("notes")
    .update({ description: description || null })
    .eq("id", noteId);

  if (error) {
    console.error("UPDATE NOTE DESCRIPTION FAILED:", error);
    throw new Error(`Could not update note description: ${error.message}`);
  }

  revalidatePath("/admin/content");
  revalidatePath("/branches");
}