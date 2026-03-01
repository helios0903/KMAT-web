"use client";

import { useEffect, useState, useMemo } from "react";
import { MeetingData, BookmarkType } from "../types";
import { loadMeeting } from "../lib/storage";
import NavHeader from "../components/NavHeader";
import BookmarkBadge from "../components/BookmarkBadge";

export default function TranscriptPage() {
  const [data, setData] = useState<MeetingData | null>(null);
  const [expandedSegment, setExpandedSegment] = useState<string | null>(null);

  useEffect(() => {
    setData(loadMeeting());
  }, []);

  // Build bookmark lookup: segmentId → BookmarkType[]
  const bookmarkMap = useMemo(() => {
    const map = new Map<string, BookmarkType[]>();
    if (!data) return map;
    for (const b of data.bookmarks) {
      const existing = map.get(b.segmentId) || [];
      existing.push(b.type);
      map.set(b.segmentId, existing);
    }
    return map;
  }, [data]);

  return (
    <div className="flex flex-col h-screen bg-[var(--background)] text-[var(--foreground)]">
      <NavHeader />

      <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-6">
        {!data || data.segments.length === 0 ? (
          <div className="flex items-center justify-center h-full text-[var(--muted)] text-lg">
            No transcript available. Start a meeting first.
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Meeting header */}
            <div className="space-y-1">
              <h2 className="text-xl font-semibold">{data.metadata.title}</h2>
              <p className="text-sm text-[var(--muted)]">
                {data.segments.length} segments ·{" "}
                {data.bookmarks.length} bookmarks ·{" "}
                {Math.floor(data.metadata.durationSeconds / 60)}m{" "}
                {data.metadata.durationSeconds % 60}s
              </p>
            </div>

            {/* Transcript */}
            <div className="space-y-1">
              {data.segments.map((seg) => {
                const segBookmarks = bookmarkMap.get(seg.id);
                const isExpanded = expandedSegment === seg.id;

                return (
                  <div
                    key={seg.id}
                    onClick={() =>
                      setExpandedSegment(isExpanded ? null : seg.id)
                    }
                    className={`
                      flex flex-col gap-1 sm:grid sm:grid-cols-[80px_1fr_1fr] sm:gap-4
                      px-3 py-2.5 rounded-lg cursor-pointer
                      transition-colors hover:bg-[var(--surface)]
                      ${segBookmarks ? "bg-yellow-500/5 border-l-2 border-yellow-500/30" : ""}
                    `}
                  >
                    {/* Timestamp */}
                    <div className="font-mono text-xs text-[var(--muted)] pt-1 flex items-start gap-1" style={{ opacity: 0.7 }}>
                      {seg.timestamp}
                      {segBookmarks && (
                        <span className="flex gap-0.5">
                          {segBookmarks.map((type, i) => (
                            <BookmarkBadge key={i} type={type} />
                          ))}
                        </span>
                      )}
                    </div>

                    {/* Korean */}
                    <p className="text-sm text-[var(--muted)] leading-relaxed">
                      {seg.korean}
                    </p>

                    {/* Chinese */}
                    <p className="text-base leading-relaxed" style={{ opacity: 0.9 }}>
                      {seg.chinese}
                    </p>

                    {/* Expanded bookmark details */}
                    {isExpanded && segBookmarks && (
                      <div className="sm:col-span-3 sm:pl-[96px] pb-2">
                        <div className="text-xs text-[var(--muted)] space-y-1" style={{ opacity: 0.7 }}>
                          {data.bookmarks
                            .filter((b) => b.segmentId === seg.id)
                            .map((b) => (
                              <div key={b.id} className="flex items-center gap-2">
                                <BookmarkBadge type={b.type} />
                                <span>
                                  Bookmarked at{" "}
                                  {new Date(b.createdAt).toLocaleTimeString()}
                                </span>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
