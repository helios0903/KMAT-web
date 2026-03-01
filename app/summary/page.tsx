"use client";

import { useEffect, useState, useCallback } from "react";
import { MeetingData } from "../types";
import { loadMeeting } from "../lib/storage";
import NavHeader from "../components/NavHeader";
import SummaryCard from "../components/SummaryCard";

function generateMarkdown(data: MeetingData): string {
  const { metadata, summary, segments } = data;
  if (!summary) return "";

  const lines: string[] = [
    `# Meeting Summary`,
    `**${metadata.title}**`,
    `Duration: ${Math.floor(metadata.durationSeconds / 60)} minutes`,
    `Generated: ${new Date(summary.generatedAt).toLocaleString()}`,
    "",
  ];

  if (summary.keyPoints.length > 0) {
    lines.push("## Key Points");
    summary.keyPoints.forEach((p) => lines.push(`- ${p}`));
    lines.push("");
  }

  if (summary.decisions.length > 0) {
    lines.push("## Decisions");
    summary.decisions.forEach((d) => lines.push(`- ${d}`));
    lines.push("");
  }

  if (summary.actionItems.length > 0) {
    lines.push("## Action Items");
    summary.actionItems.forEach((a) => lines.push(`- [ ] ${a}`));
    lines.push("");
  }

  if (summary.flaggedSegments.length > 0) {
    lines.push("## Flagged Segments");
    summary.flaggedSegments.forEach((f) => {
      const seg = segments.find((s) => s.id === f.segmentId);
      const label = seg ? `[${seg.timestamp}] ${seg.chinese}` : f.segmentId;
      lines.push(`- **${label}**: ${f.reason}`);
    });
    lines.push("");
  }

  return lines.join("\n");
}

export default function SummaryPage() {
  const [data, setData] = useState<MeetingData | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setData(loadMeeting());
  }, []);

  const copyMarkdown = useCallback(() => {
    if (!data) return;
    const md = generateMarkdown(data);
    navigator.clipboard.writeText(md).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [data]);

  const summary = data?.summary;

  return (
    <div className="flex flex-col h-screen bg-[var(--background)] text-[var(--foreground)]">
      <NavHeader />

      <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-6">
        {!summary ? (
          <div className="flex items-center justify-center h-full text-[var(--muted)] text-lg">
            No summary generated yet. End a meeting to generate one.
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Meeting info */}
            <div className="space-y-1">
              <h2 className="text-xl font-semibold">{data?.metadata.title}</h2>
              <p className="text-sm text-[var(--muted)]">
                {data?.metadata.durationSeconds
                  ? `${Math.floor(data.metadata.durationSeconds / 60)}m ${data.metadata.durationSeconds % 60}s`
                  : ""}{" "}
                · {data?.segments.length} segments · {data?.bookmarks.length} bookmarks
              </p>
            </div>

            {/* Summary cards */}
            <div className="grid gap-4">
              <SummaryCard title="Key Points" items={summary.keyPoints} icon="💡" />
              <SummaryCard title="Decisions" items={summary.decisions} icon="✅" />
              <SummaryCard title="Action Items" items={summary.actionItems} icon="📋" />
            </div>

            {/* Flagged segments */}
            {summary.flaggedSegments.length > 0 && (
              <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
                <h3 className="text-sm font-medium text-[var(--muted)] mb-3 flex items-center gap-2">
                  <span>🚩</span> Flagged Segments
                </h3>
                <div className="space-y-3">
                  {summary.flaggedSegments.map((f, i) => {
                    const seg = data?.segments.find((s) => s.id === f.segmentId);
                    return (
                      <div key={i} className="pl-4 border-l-2 border-yellow-500/30">
                        {seg && (
                          <p className="text-sm mb-1" style={{ opacity: 0.7 }}>
                            <span className="font-mono text-[var(--muted)] mr-2">{seg.timestamp}</span>
                            {seg.chinese}
                          </p>
                        )}
                        <p className="text-sm text-[var(--muted)]">{f.reason}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Export */}
            <div className="flex justify-end pt-2 pb-8">
              <button
                onClick={copyMarkdown}
                className="px-6 py-2 rounded-full text-sm font-medium transition-all bg-[var(--surface)] text-[var(--muted)] border border-[var(--border)] hover:opacity-80"
              >
                {copied ? "Copied!" : "Copy as Markdown"}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
