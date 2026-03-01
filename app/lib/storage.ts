import {
  MeetingData,
  TranslationSegment,
  Bookmark,
  MeetingSummary,
  GlossaryTerm,
  AppSettings,
} from "../types";

const STORAGE_KEY = "kmat_current_meeting";
const GLOSSARY_KEY = "kmat_glossary";
const SETTINGS_KEY = "kmat_settings";

export function saveMeeting(data: MeetingData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function loadMeeting(): MeetingData | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as MeetingData;
  } catch {
    return null;
  }
}

export function clearMeeting(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function saveSegments(segments: TranslationSegment[]): void {
  const data = loadMeeting();
  if (data) {
    data.segments = segments;
    saveMeeting(data);
  }
}

export function saveBookmarks(bookmarks: Bookmark[]): void {
  const data = loadMeeting();
  if (data) {
    data.bookmarks = bookmarks;
    saveMeeting(data);
  }
}

export function saveSummary(summary: MeetingSummary): void {
  const data = loadMeeting();
  if (data) {
    data.summary = summary;
    saveMeeting(data);
  }
}

// Glossary
export function saveGlossary(terms: GlossaryTerm[]): void {
  localStorage.setItem(GLOSSARY_KEY, JSON.stringify(terms));
}

export function loadGlossary(): GlossaryTerm[] {
  const raw = localStorage.getItem(GLOSSARY_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as GlossaryTerm[];
  } catch {
    return [];
  }
}

// Settings
const DEFAULT_SETTINGS: AppSettings = {
  targetLang: "zh-CN",
  fontSize: 28,
  theme: "dark",
};

export function saveSettings(settings: AppSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function loadSettings(): AppSettings {
  const raw = localStorage.getItem(SETTINGS_KEY);
  if (!raw) return { ...DEFAULT_SETTINGS };
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}
