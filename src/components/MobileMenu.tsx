"use client";

import Link from "next/link";
import { useState } from "react";

export default function MobileMenu({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [open, setOpen] = useState(false);

  const links = [
    { href: "/", label: "Home" },
    { href: "/branches", label: "Branches" },
    { href: "/search", label: "Search" },
    isLoggedIn ? { href: "/dashboard", label: "Dashboard" } : { href: "/login", label: "Login" }
  ];

  return (
    <div className="sm:hidden">
      <button
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="text-lg text-slate-600"
      >
        {open ? "✕" : "☰"}
      </button>

      {open && (
        <div className="absolute inset-x-0 top-full border-b border-slate-200 bg-white shadow-sm">
          <nav className="mx-auto flex max-w-5xl flex-col px-4 py-2 text-sm font-medium text-slate-700">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="border-b border-slate-100 py-3 last:border-none"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
}
