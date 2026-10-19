"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/dashboard", label: "Dashboard", icon: "🏠" },
  { href: "/branches", label: "Branches", icon: "🎓" },
  { href: "/dashboard/bookmarks", label: "Saved", icon: "🔖" },
  { href: "/dashboard/profile", label: "Profile", icon: "👤" }
];

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white/95 backdrop-blur pb-[env(safe-area-inset-bottom,0px)]">
      <div className="mx-auto grid max-w-2xl grid-cols-4">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 py-2.5 text-xs font-medium ${
                active ? "text-brand-700" : "text-slate-500"
              }`}
            >
              <span className="text-lg leading-none">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
