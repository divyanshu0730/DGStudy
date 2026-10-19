"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/supabase/guards";

export async function toggleBookmark(chapterId: string, currentlyBookmarked: boolean, path: string) {
  const { supabase, user } = await requireUser();

  if (currentlyBookmarked) {
    await supabase.from("bookmarks").delete().eq("user_id", user.id).eq("chapter_id", chapterId);
  } else {
    await supabase.from("bookmarks").insert({ user_id: user.id, chapter_id: chapterId });
  }
  revalidatePath(path);
  revalidatePath("/dashboard/bookmarks");
}

export async function toggleCompleted(chapterId: string, currentlyCompleted: boolean, path: string) {
  const { supabase, user } = await requireUser();

  if (currentlyCompleted) {
    await supabase.from("progress").delete().eq("user_id", user.id).eq("chapter_id", chapterId);
  } else {
    await supabase
      .from("progress")
      .upsert(
        { user_id: user.id, chapter_id: chapterId, completed: true, completed_at: new Date().toISOString() },
        { onConflict: "user_id,chapter_id" }
      );
  }
  revalidatePath(path);
  revalidatePath("/dashboard");
}
