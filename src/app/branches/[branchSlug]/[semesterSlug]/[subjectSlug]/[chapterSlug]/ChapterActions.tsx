"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { toggleBookmark, toggleCompleted } from "@/app/branches/actions";

export default function ChapterActions({
  chapterId,
  path,
  isLoggedIn,
  initialBookmarked,
  initialCompleted,
  hasNote
}: {
  chapterId: string;
  path: string;
  isLoggedIn: boolean;
  initialBookmarked: boolean;
  initialCompleted: boolean;
  hasNote: boolean;
}) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [completed, setCompleted] = useState(initialCompleted);
  const [showViewer, setShowViewer] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [, startTransition] = useTransition();

  async function handleDownload() {
    setDownloading(true);
    try {
      const res = await fetch(`/api/chapters/${chapterId}/signed-url?mode=download`);
      const json = await res.json();
      if (json.url) window.open(json.url, "_blank");
    } finally {
      setDownloading(false);
    }
  }

  if (!hasNote) {
    return (
      <div className="card p-6 text-center">
        <div className="text-2xl">📄</div>
        <p className="mt-2 text-sm font-medium text-slate-700">Notes coming soon.</p>
        <p className="mt-1 text-xs text-slate-500">The admin hasn't uploaded a PDF for this chapter yet.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <button className="btn-primary col-span-2 sm:col-span-1" onClick={() => setShowViewer((v) => !v)}>
          {showViewer ? "Hide notes" : "View Notes"}
        </button>
        <button className="btn-secondary" onClick={handleDownload} disabled={downloading}>
          {downloading ? "…" : "⬇ Download"}
        </button>

        {isLoggedIn ? (
          <>
            <button
              className="btn-secondary"
              onClick={() => {
                setBookmarked((b) => !b);
                startTransition(() => toggleBookmark(chapterId, bookmarked, path));
              }}
            >
              {bookmarked ? "🔖 Saved" : "🔖 Bookmark"}
            </button>
            <button
              className="btn-secondary"
              onClick={() => {
                setCompleted((c) => !c);
                startTransition(() => toggleCompleted(chapterId, completed, path));
              }}
            >
              {completed ? "✓ Completed" : "Mark Completed"}
            </button>
          </>
        ) : (
          <Link href={`/login?next=${encodeURIComponent(path)}`} className="btn-secondary col-span-2 text-center">
            Log in to bookmark &amp; track progress
          </Link>
        )}
      </div>

      {showViewer && <ChapterPdfFrame chapterId={chapterId} />}
    </div>
  );
}

function ChapterPdfFrame({ chapterId }: { chapterId: string }) {
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/chapters/${chapterId}/signed-url?mode=view`)
      .then((r) => r.json())
      .then((json) => {
        if (cancelled) return;
        if (json.url) setUrl(json.url);
        else setError(true);
      })
      .catch(() => !cancelled && setError(true));
    return () => {
      cancelled = true;
    };
  }, [chapterId]);

  if (error) {
    return (
      <div className="card mt-3 p-6 text-center text-sm text-slate-500">
        Unable to load the PDF. Please try again or use Download instead.
      </div>
    );
  }

  if (!url) {
    return (
      <div className="card mt-3 flex h-[60vh] items-center justify-center text-sm text-slate-400">
        Loading PDF…
      </div>
    );
  }

  return (
    <div className="card mt-3 overflow-hidden">
      <iframe src={url} className="h-[70vh] w-full" title="PDF viewer" />
    </div>
  );
}
