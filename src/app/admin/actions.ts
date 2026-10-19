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

  const { data: branch } = await supabase
    .from("branches")
    .insert({ name, slug: slugify(name), description: description || null, order_index: 0 })
    .select("id")
    .single();

  // Auto-provision all 6 semesters for a new branch, per spec.
  if (branch) {
    const rows = Array.from({ length: 6 }, (_, i) => ({
      branch_id: branch.id,
      semester_number: i + 1,
      name: `${ordinal(i + 1)} Semester`,
      slug: `${ordinal(i + 1)}-semester`
    }));
    await supabase.from("semesters").upsert(rows, { onConflict: "branch_id,semester_number" });
  }

  revalidatePath("/admin/branches");
  revalidatePath("/branches");
}

export async function deleteBranch(branchId: string) {
  const { supabase } = await requireAdmin();
  await supabase.from("branches").delete().eq("id", branchId);
  revalidatePath("/admin/branches");
  revalidatePath("/branches");
}

// Ensures all 6 semesters exist for a branch (idempotent) — for branches
// seeded before this admin action existed.
export async function ensureSemesters(branchId: string) {
  const { supabase } = await requireAdmin();
  const rows = Array.from({ length: 6 }, (_, i) => ({
    branch_id: branchId,
    semester_number: i + 1,
    name: `${ordinal(i + 1)} Semester`,
    slug: `${ordinal(i + 1)}-semester`
  }));
  await supabase.from("semesters").upsert(rows, { onConflict: "branch_id,semester_number" });
  revalidatePath("/admin/branches");
}

// ---------- Subjects ----------

export async function createSubject(formData: FormData) {
  const { supabase } = await requireAdmin();

  const semesterId = String(formData.get("semester_id") || "");
  const name = String(formData.get("name") || "").trim();
  const subjectCode = String(formData.get("subject_code") || "").trim();

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
      order_index: 0
    })
    .select("id, name")
    .single();

  if (error) {
    console.error("CREATE SUBJECT FAILED:", error);
    throw new Error(`Could not create subject: ${error.message}`);
  }

      console.log("SUBJECT CREATED:", data);

  const { data: semester, error: semesterError } = await supabase
    .from("semesters")
    .select("branch_id")
    .eq("id", semesterId)
    .single();

  if (semesterError || !semester) {
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

  if (!subjectId || !name) {
    throw new Error("Subject ID or chapter name is missing.");
  }

  const baseSlug = slugify(name);

  if (!baseSlug) {
    throw new Error("Please enter a valid chapter name.");
  }

  // Check for an existing chapter with the same slug.
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
      chapter_number: nextNumber,
      order_index: nextNumber
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
export async function uploadNote(formData: FormData) {
  const { supabase } = await requireAdmin();
  const chapterId = String(formData.get("chapter_id") || "");
  const title = String(formData.get("title") || "").trim();
  const file = formData.get("file") as File | null;

  if (!chapterId || !title || !file || file.size === 0) return;
  if (file.type !== "application/pdf") return;
  if (file.size > 50 * 1024 * 1024) return; // 50MB cap

  const { count } = await supabase
    .from("notes")
    .select("id", { count: "exact", head: true })
    .eq("chapter_id", chapterId);
  const version = (count ?? 0) + 1;

  const admin = createAdminClient();
  const path = `${chapterId}/v${version}-${Date.now()}-${slugify(title)}.pdf`;
  const arrayBuffer = await file.arrayBuffer();

  const { error: uploadError } = await admin.storage.from("pdfs").upload(path, arrayBuffer, {
    contentType: "application/pdf",
    upsert: false
  });
  if (uploadError) return;

  await supabase.from("notes").insert({
    chapter_id: chapterId,
    title,
    storage_path: path,
    file_size: file.size,
    version,
    published: false
  });

  revalidatePath("/admin/content");
}

export async function replaceNoteFile(noteId: string, formData: FormData) {
  const { supabase } = await requireAdmin();
  const file = formData.get("file") as File | null;
  if (!file || file.size === 0 || file.type !== "application/pdf") return;
  if (file.size > 50 * 1024 * 1024) return;

  const { data: note } = await supabase.from("notes").select("storage_path").eq("id", noteId).single();
  if (!note) return;

  const admin = createAdminClient();
  const arrayBuffer = await file.arrayBuffer();
  const { error } = await admin.storage.from("pdfs").update(note.storage_path, arrayBuffer, {
    contentType: "application/pdf",
    upsert: true
  });
  if (error) return;

  await supabase.from("notes").update({ file_size: file.size, updated_at: new Date().toISOString() }).eq("id", noteId);
  revalidatePath("/admin/content");
}

export async function togglePublish(noteId: string, currentlyPublished: boolean) {
  const { supabase } = await requireAdmin();
  await supabase.from("notes").update({ published: !currentlyPublished }).eq("id", noteId);
  revalidatePath("/admin/content");
}

export async function deleteNote(noteId: string) {
  const { supabase } = await requireAdmin();
  const { data: note } = await supabase.from("notes").select("storage_path").eq("id", noteId).single();
  if (note) {
    const admin = createAdminClient();
    await admin.storage.from("pdfs").remove([note.storage_path]);
  }
  await supabase.from("notes").delete().eq("id", noteId);
  revalidatePath("/admin/content");
}
