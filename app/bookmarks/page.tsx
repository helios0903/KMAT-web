"use client";

import { useEffect, useState } from "react";
import { MeetingData, BookmarkType } from "../types";
import { loadMeeting } from "../lib/storage";
import NavHeader from "../components/NavHeader";
import BookmarkBadge from "../components/BookmarkBadge";

const FILTER_OPTIONS: { value: BookmarkType | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "star", label: "⭐ Star" },
  { value: "question", label: "❓ Question" },
  { value: "pin", label: "📌 Pin" },
];

export default function BookmarksPage() {
  const [data, setData] = useState<MeetingData | null>(null);
  const [filter, setFilter] = useState<BookmarkType | "all">("all");

  useEffect(() => {
    setData(loadMeeting());
  }, []);

  const filteredBookmarks =
    data?.bookmarks.filter((b) => filter === "all" || b.type === filter) ?? [];

  return (
    <div className="flex flex-col h-screen bg-[var(--background)] text-[var(--foreground)]">
      <NavHeader />

      <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-6">
        {!data || data.bookmarks.length === 0 ? (
          <div className="flex items-center justify-center h-full text-[var(--muted)] text-lg">
            No bookmarks yet. Use the bookmark buttons during a meeting.
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-xl font-semibold">
              Bookmarks
              <span className="text-sm font-normal text-[var(--muted)] ml-2">
                {data.bookmarks.length} total
              </span>
            </h2>

            {/* Filter tabs */}
            <div className="flex gap-1">
              {FILTER_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setFilter(opt.value)}
                  className={`px-3 py-1.5 rounded text-sm transition-colors ${
                    filter === opt.value
                      ? "bg-[var(--surface)] text-[var(--foreground)]"
                      : "text-[var(--muted)] hover:text-[var(--foreground)]"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Bookmark list */}
            <div className="space-y-3">
              {filteredBookmarks.length === 0 ? (
                <p className="text-[var(--muted)] text-sm py-8 text-center">
                  No bookmarks match this filter.
                </p>
              ) : (
                filteredBookmarks.map((bookmark) => {
                  const seg = data.segments.find(
                    (s) => s.id === bookmark.segmentId
                  );
                  if (!seg) return null;
                  return (
                    <div
                      key={bookmark.id}
                      className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 space-y-2"
                    >
                      <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
                        <BookmarkBadge type={bookmark.type} />
                        <span className="font-mono">{seg.timestamp}</span>
                        <span style={{ opacity: 0.4 }}>·</span>
                        <span>
                          {new Date(bookmark.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-lg leading-relaxed" style={{ opacity: 0.9 }}>
                        {seg.chinese}
                      </p>
                      <p className="text-sm text-[var(--muted)] leading-relaxed">
                        {seg.korean}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
