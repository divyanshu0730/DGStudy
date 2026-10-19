import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Issues a short-lived signed URL for a chapter's currently published PDF.
// Login is OPTIONAL: anonymous visitors can view/download published notes.
// Admins may preview unpublished notes. Recently-viewed / download-history
// are only recorded for logged-in users.
export async function GET(req: NextRequest, { params }: { params: { chapterId: string } }) {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    isAdmin = profile?.role === "admin";
  }

  let noteQuery = supabase
    .from("notes")
    .select("id, title, storage_path, published")
    .eq("chapter_id", params.chapterId)
    .order("version", { ascending: false })
    .limit(1);

  if (!isAdmin) noteQuery = noteQuery.eq("published", true);

  const { data: note } = await noteQuery.maybeSingle();
  if (!note) return NextResponse.json({ error: "Notes coming soon." }, { status: 404 });

  const mode = req.nextUrl.searchParams.get("mode") === "download" ? "download" : "view";
  const admin = createAdminClient();
  const { data: signed, error } = await admin.storage
    .from("pdfs")
    .createSignedUrl(note.storage_path, 60, mode === "download" ? { download: `${note.title}.pdf` } : undefined);

  if (error || !signed) {
    return NextResponse.json({ error: "Could not generate file link" }, { status: 500 });
  }

  if (user) {
    if (mode === "view") {
      await supabase
        .from("recently_viewed")
        .upsert(
          { user_id: user.id, chapter_id: params.chapterId, viewed_at: new Date().toISOString() },
          { onConflict: "user_id,chapter_id" }
        );
    } else {
      await supabase.from("downloads").insert({ user_id: user.id, chapter_id: params.chapterId });
    }
  }

  return NextResponse.json({ url: signed.signedUrl });
}
