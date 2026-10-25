import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

// Lists static pages plus every branch, semester, subject and chapter URL.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://dgstudy.in";
  const supabase = createClient();

  const entries: MetadataRoute.Sitemap = [
    { url: `${base}/`, priority: 1 },
    { url: `${base}/branches`, priority: 0.9 },
    { url: `${base}/search`, priority: 0.5 },
    { url: `${base}/about`, priority: 0.4 },
    { url: `${base}/contact`, priority: 0.4 },
    { url: `${base}/privacy-policy`, priority: 0.3 },
    { url: `${base}/terms`, priority: 0.3 }
  ];

  const seen = new Set<string>();
  const add = (url: string, priority: number) => {
    if (seen.has(url)) return;
    seen.add(url);
    entries.push({ url, priority });
  };

  const { data: chapters } = await supabase
    .from("chapters")
    .select("slug, subjects(slug, semesters(slug, branches(slug)))")
    .limit(5000);

  for (const c of chapters || []) {
    const s: any = c.subjects;
    const sem: any = s?.semesters;
    const b: any = sem?.branches;
    if (!s || !sem || !b) continue;

    add(`${base}/branches/${b.slug}`, 0.8);
    add(`${base}/branches/${b.slug}/${sem.slug}`, 0.7);
    add(`${base}/branches/${b.slug}/${sem.slug}/${s.slug}`, 0.7);
    add(`${base}/branches/${b.slug}/${sem.slug}/${s.slug}/${c.slug}`, 0.6);
  }

  return entries;
}