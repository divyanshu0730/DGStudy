import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

// Lists static pages plus every published branch/semester/subject/chapter URL.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const supabase = createClient();

  const entries: MetadataRoute.Sitemap = [
    { url: `${base}/`, priority: 1 },
    { url: `${base}/branches`, priority: 0.9 },
    { url: `${base}/search`, priority: 0.5 }
  ];

  const { data: chapters } = await supabase
    .from("chapters")
    .select("slug, subjects(slug, semesters(slug, branches(slug)))")
    .limit(5000);

  for (const c of chapters || []) {
    const s: any = c.subjects;
    const sem: any = s?.semesters;
    const b: any = sem?.branches;
    if (!s || !sem || !b) continue;
    entries.push({
      url: `${base}/branches/${b.slug}/${sem.slug}/${s.slug}/${c.slug}`,
      priority: 0.6
    });
  }

  return entries;
}
