"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "Meeting" },
  { href: "/transcript", label: "Transcript" },
  { href: "/bookmarks", label: "Bookmarks" },
  { href: "/summary", label: "Summary" },
  { href: "/glossary", label: "Glossary" },
  { href: "/settings", label: "Settings" },
];

export default function NavHeader({
  children,
  isRecording,
}: {
  children?: React.ReactNode;
  isRecording?: boolean;
}) {
  const pathname = usePathname();

  return (
    <header
      className={`flex items-center justify-between px-4 sm:px-6 py-3 border-b border-[var(--border)] ${
        isRecording ? "recording-glow" : ""
      }`}
    >
      <div className="flex items-center gap-3 sm:gap-6 min-w-0">
        <h1 className="text-lg font-semibold tracking-tight shrink-0">KMAT</h1>
        <nav className="flex items-center gap-0.5 sm:gap-1 overflow-x-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-2 sm:px-3 py-1 rounded text-xs sm:text-sm whitespace-nowrap transition-colors ${
                  isActive
                    ? "text-[var(--foreground)] bg-[var(--surface)]"
                    : "text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
      {children && (
        <div className="flex items-center gap-4 shrink-0">{children}</div>
      )}
    </header>
  );
}
