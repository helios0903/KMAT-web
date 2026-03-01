export interface TranslationSegment {
  id: string;
  timestamp: string;
  korean: string;
  chinese: string;
}

export type BookmarkType = "star" | "question" | "pin";

export interface Bookmark {
  id: string;
  segmentId: string;
  type: BookmarkType;
  createdAt: string;
}

export interface MeetingMetadata {
  id: string;
  title: string;
  startedAt: string;
  endedAt: string | null;
  durationSeconds: number;
}

export interface MeetingSummary {
  keyPoints: string[];
  decisions: string[];
  actionItems: string[];
  flaggedSegments: { segmentId: string; reason: string }[];
  generatedAt: string;
  rawMarkdown: string;
}

export interface MeetingData {
  metadata: MeetingMetadata;
  segments: TranslationSegment[];
  bookmarks: Bookmark[];
  summary: MeetingSummary | null;
}

export interface GlossaryTerm {
  id: string;
  korean: string;
  translation: string;
}

export interface AppSettings {
  targetLang: "zh-CN" | "en";
  fontSize: number; // 20-40, default 28
  theme: "dark" | "light";
}
