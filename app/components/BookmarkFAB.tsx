"use client";

import { BookmarkType } from "../types";

const BUTTONS: { type: BookmarkType; icon: string; label: string }[] = [
  { type: "star", icon: "⭐", label: "Star" },
  { type: "question", icon: "❓", label: "Question" },
  { type: "pin", icon: "📌", label: "Pin" },
];

export default function BookmarkFAB({
  onBookmark,
  disabled,
}: {
  onBookmark: (type: BookmarkType) => void;
  disabled: boolean;
}) {
  return (
    <div className="fixed bottom-24 right-4 sm:right-6 flex flex-col gap-2 z-50">
      {BUTTONS.map((btn) => (
        <button
          key={btn.type}
          onClick={() => onBookmark(btn.type)}
          disabled={disabled}
          title={`Bookmark as ${btn.label}`}
          className={`
            w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-base sm:text-lg
            border border-[var(--border)] backdrop-blur-sm transition-all
            ${
              disabled
                ? "opacity-30 cursor-not-allowed bg-[var(--surface)]"
                : "bg-[var(--surface)] hover:opacity-80 hover:scale-110 active:scale-95"
            }
          `}
        >
          {btn.icon}
        </button>
      ))}
    </div>
  );
}
