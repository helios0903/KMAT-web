"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { TranslationSegment, Bookmark, BookmarkType, MeetingMetadata, GlossaryTerm, AppSettings } from "./types";
import {
  saveMeeting,
  loadMeeting,
  saveSegments,
  saveBookmarks,
  loadGlossary,
  loadSettings,
} from "./lib/storage";
import NavHeader from "./components/NavHeader";
import BookmarkFAB from "./components/BookmarkFAB";
import BookmarkBadge from "./components/BookmarkBadge";

const LANG_MAP: Record<AppSettings["targetLang"], string> = {
  "zh-CN": "Chinese (Simplified)",
  en: "English",
};

export default function MeetingPage() {
  const [segments, setSegments] = useState<TranslationSegment[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [interimText, setInterimText] = useState("");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [translating, setTranslating] = useState(false);
  const [meetingId, setMeetingId] = useState<string | null>(null);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [meetingEnded, setMeetingEnded] = useState(false);
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [settings, setSettings] = useState<AppSettings | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const translationEndRef = useRef<HTMLDivElement>(null);
  const elapsedSecondsRef = useRef(0);
  const glossaryRef = useRef<GlossaryTerm[]>([]);
  const settingsRef = useRef<AppSettings | null>(null);
  // Fragment buffer: accumulate short Korean snippets before translating
  const fragmentBufferRef = useRef("");
  const fragmentTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const FRAGMENT_MIN_LENGTH = 4;
  const FRAGMENT_FLUSH_MS = 1500;
  const router = useRouter();

  // Bookmark lookup: segmentId → BookmarkType[]
  const bookmarkMap = useMemo(() => {
    const map = new Map<string, BookmarkType[]>();
    for (const b of bookmarks) {
      const existing = map.get(b.segmentId) || [];
      existing.push(b.type);
      map.set(b.segmentId, existing);
    }
    return map;
  }, [bookmarks]);

  // Load meeting, glossary, and settings from localStorage on mount
  useEffect(() => {
    const data = loadMeeting();
    if (data) {
      setMeetingId(data.metadata.id);
      setSegments(data.segments);
      setBookmarks(data.bookmarks);
      setElapsedSeconds(data.metadata.durationSeconds);
      if (data.metadata.endedAt) {
        setMeetingEnded(true);
      }
    }
    glossaryRef.current = loadGlossary();

    const s = loadSettings();
    setSettings(s);
    settingsRef.current = s;
  }, []);

  // Auto-scroll to latest translation
  useEffect(() => {
    translationEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [segments]);

  // Sync elapsedSeconds to ref for use in callbacks
  useEffect(() => {
    elapsedSecondsRef.current = elapsedSeconds;
  }, [elapsedSeconds]);

  // Persist segments to localStorage whenever they change
  useEffect(() => {
    if (meetingId && segments.length > 0) {
      saveSegments(segments);
    }
  }, [segments, meetingId]);

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const translateText = useCallback(async (korean: string) => {
    setTranslating(true);
    try {
      const targetLang = LANG_MAP[settingsRef.current?.targetLang ?? "zh-CN"];
      const glossaryTerms = glossaryRef.current.map(({ korean, translation }) => ({ korean, translation }));

      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: korean,
          targetLang,
          glossary: glossaryTerms.length > 0 ? glossaryTerms : undefined,
        }),
      });
      const data = await res.json();
      if (data.translation) {
        const segment: TranslationSegment = {
          id: crypto.randomUUID(),
          timestamp: formatTime(elapsedSecondsRef.current),
          korean,
          chinese: data.translation,
        };
        setSegments((prev) => [...prev, segment]);
      }
    } catch (err) {
      console.error("Translation request failed:", err);
    } finally {
      setTranslating(false);
    }
  }, []);

  // Buffer short fragments, flush when long enough or after silence
  const handleFinalResult = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    if (fragmentTimerRef.current) {
      clearTimeout(fragmentTimerRef.current);
      fragmentTimerRef.current = null;
    }

    const buffered = fragmentBufferRef.current
      ? fragmentBufferRef.current + " " + trimmed
      : trimmed;

    if (buffered.length >= FRAGMENT_MIN_LENGTH) {
      fragmentBufferRef.current = "";
      translateText(buffered);
    } else {
      // Too short — hold and flush after silence
      fragmentBufferRef.current = buffered;
      fragmentTimerRef.current = setTimeout(() => {
        if (fragmentBufferRef.current) {
          translateText(fragmentBufferRef.current);
          fragmentBufferRef.current = "";
        }
      }, FRAGMENT_FLUSH_MS);
    }
  }, [translateText, FRAGMENT_MIN_LENGTH, FRAGMENT_FLUSH_MS]);

  const startRecording = useCallback(async () => {
    // Initialize meeting if first time
    if (!meetingId) {
      const id = crypto.randomUUID();
      setMeetingId(id);
      const metadata: MeetingMetadata = {
        id,
        title: `Meeting ${new Date().toLocaleString()}`,
        startedAt: new Date().toISOString(),
        endedAt: null,
        durationSeconds: 0,
      };
      saveMeeting({ metadata, segments: [], bookmarks: [], summary: null });
    }

    // 1. Get Deepgram API key from server
    let dgKey: string;
    try {
      const res = await fetch("/api/deepgram");
      const data = await res.json();
      if (data.error) { alert(data.error); return; }
      dgKey = data.key;
    } catch {
      alert("Failed to get Deepgram API key.");
      return;
    }

    // 2. Get microphone access
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      alert("Microphone access denied.");
      return;
    }
    streamRef.current = stream;

    // 3. Open WebSocket to Deepgram
    const dgUrl = "wss://api.deepgram.com/v1/listen?" +
      "language=ko&model=nova-2&smart_format=true&interim_results=true&utterance_end_ms=1500&vad_events=true";
    const ws = new WebSocket(dgUrl, ["token", dgKey]);
    wsRef.current = ws;

    ws.onopen = () => {
      // 4. Start MediaRecorder and pipe audio to WebSocket
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm;codecs=opus" });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0 && ws.readyState === WebSocket.OPEN) {
          ws.send(e.data);
        }
      };
      recorder.start(250); // send chunks every 250ms
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === "Results") {
          const alt = msg.channel?.alternatives?.[0];
          if (!alt) return;
          const transcript = alt.transcript || "";

          if (msg.is_final && transcript) {
            setInterimText("");
            if (msg.speech_final) {
              // End of utterance — send buffered + this for translation
              handleFinalResult(transcript);
            } else {
              // Final chunk but speaker continues — buffer it
              fragmentBufferRef.current = fragmentBufferRef.current
                ? fragmentBufferRef.current + " " + transcript
                : transcript;
            }
          } else if (transcript) {
            // Interim result — show as live preview
            const preview = fragmentBufferRef.current
              ? fragmentBufferRef.current + " " + transcript
              : transcript;
            setInterimText(preview);
          }
        }
      } catch {
        // ignore parse errors
      }
    };

    ws.onerror = () => {
      console.error("Deepgram WebSocket error");
    };

    ws.onclose = () => {
      console.log("Deepgram WebSocket closed");
    };

    setIsRecording(true);
    setMeetingEnded(false);

    timerRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
  }, [handleFinalResult, meetingId]);

  const cleanupRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (fragmentTimerRef.current) {
      clearTimeout(fragmentTimerRef.current);
      fragmentTimerRef.current = null;
    }
    if (fragmentBufferRef.current) {
      translateText(fragmentBufferRef.current);
      fragmentBufferRef.current = "";
    }
  }, [translateText]);

  const stopRecording = useCallback(() => {
    cleanupRecording();
    setIsRecording(false);
    setInterimText("");

    const data = loadMeeting();
    if (data) {
      data.metadata.durationSeconds = elapsedSecondsRef.current;
      saveMeeting(data);
    }
  }, [cleanupRecording]);

  const addBookmark = useCallback(
    (type: BookmarkType) => {
      if (segments.length === 0) return;
      const latestSegment = segments[segments.length - 1];
      const bookmark: Bookmark = {
        id: crypto.randomUUID(),
        segmentId: latestSegment.id,
        type,
        createdAt: new Date().toISOString(),
      };
      setBookmarks((prev) => {
        const next = [...prev, bookmark];
        saveBookmarks(next);
        return next;
      });
    },
    [segments]
  );

  const endMeeting = useCallback(async () => {
    cleanupRecording();
    setIsRecording(false);
    setInterimText("");
    setMeetingEnded(true);
    setGeneratingSummary(true);

    // Update metadata
    const data = loadMeeting();
    if (data) {
      data.metadata.endedAt = new Date().toISOString();
      data.metadata.durationSeconds = elapsedSecondsRef.current;
      saveMeeting(data);
    }

    // Generate summary
    try {
      const res = await fetch("/api/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ segments, bookmarks }),
      });
      const result = await res.json();
      if (result.summary) {
        const meeting = loadMeeting();
        if (meeting) {
          meeting.summary = result.summary;
          saveMeeting(meeting);
        }
      }
      router.push("/summary");
    } catch (err) {
      console.error("Summary generation failed:", err);
      setGeneratingSummary(false);
    }
  }, [segments, bookmarks, router, cleanupRecording]);

  const newMeeting = useCallback(() => {
    setSegments([]);
    setBookmarks([]);
    setElapsedSeconds(0);
    setMeetingId(null);
    setMeetingEnded(false);
    setGeneratingSummary(false);
    // Don't clear localStorage — keep it for viewing in other pages
  }, []);

  const fontSize = settings?.fontSize ?? 28;

  return (
    <div className="flex flex-col h-screen bg-[var(--background)] text-[var(--foreground)]">
      <NavHeader isRecording={isRecording}>
        <div className="font-mono text-sm text-[var(--muted)] tabular-nums">
          {formatTime(elapsedSeconds)}
        </div>
        <div className="text-xs text-[var(--muted)]">
          {segments.length} segments
        </div>
      </NavHeader>

      {/* Main translation display */}
      <main className="flex-1 flex flex-col min-h-0">
        {/* Chinese translation area (top, large) */}
        <div className="flex-[3] sm:flex-[3] overflow-y-auto px-4 sm:px-8 py-6">
          {segments.length === 0 && !interimText ? (
            <div className="flex items-center justify-center h-full text-[var(--muted)] text-lg">
              {isRecording
                ? "Listening for Korean speech..."
                : meetingEnded
                  ? "Meeting ended. View summary or start a new meeting."
                  : "Press Start to begin translation"}
            </div>
          ) : (
            <div className="space-y-4">
              {segments.map((seg) => {
                const segBookmarks = bookmarkMap.get(seg.id);
                return (
                  <div
                    key={seg.id}
                    className={`space-y-1 rounded-lg px-3 py-2 -mx-3 transition-colors ${
                      segBookmarks ? "bg-yellow-500/5 border-l-2 border-yellow-500/30" : ""
                    }`}
                  >
                    <div className="text-xs text-[var(--muted)] font-mono flex items-center gap-2" style={{ opacity: 0.6 }}>
                      {seg.timestamp}
                      {segBookmarks?.map((type, i) => (
                        <BookmarkBadge key={i} type={type} />
                      ))}
                    </div>
                    <p
                      className="leading-relaxed font-medium"
                      style={{ fontSize: `${fontSize}px` }}
                    >
                      {seg.chinese}
                    </p>
                  </div>
                );
              })}
              {translating && (
                <div className="flex items-center gap-2 text-[var(--muted)]">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
                  <span className="text-sm">Translating...</span>
                </div>
              )}
              <div ref={translationEndRef} />
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-[var(--border)]" />

        {/* Korean original area (bottom, smaller) */}
        <div className="flex-[2] sm:flex-[2] overflow-y-auto px-4 sm:px-8 py-4 bg-[var(--surface)]">
          {segments.length === 0 && !interimText ? (
            <div className="flex items-center justify-center h-full text-[var(--muted)] text-sm" style={{ opacity: 0.5 }}>
              Korean original text will appear here
            </div>
          ) : (
            <div className="space-y-3">
              {segments.map((seg) => {
                const segBookmarks = bookmarkMap.get(seg.id);
                return (
                  <div
                    key={seg.id}
                    className={`space-y-0.5 rounded px-2 py-1 -mx-2 ${
                      segBookmarks ? "bg-yellow-500/5" : ""
                    }`}
                  >
                    <div className="text-xs text-[var(--muted)] font-mono flex items-center gap-1" style={{ opacity: 0.5 }}>
                      {seg.timestamp}
                      {segBookmarks?.map((type, i) => (
                        <BookmarkBadge key={i} type={type} />
                      ))}
                    </div>
                    <p className="text-base text-[var(--muted)] leading-relaxed">
                      {seg.korean}
                    </p>
                  </div>
                );
              })}
              {interimText && (
                <p className="text-base text-blue-400/70 leading-relaxed italic">
                  {interimText}
                </p>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Controls */}
      <footer className="flex items-center justify-center gap-3 px-4 sm:px-6 py-4 border-t border-[var(--border)] flex-wrap">
        {meetingEnded ? (
          <button
            onClick={newMeeting}
            className="px-8 py-3 rounded-full text-sm font-medium transition-all bg-[var(--surface)] text-[var(--muted)] border border-[var(--border)] hover:opacity-80"
          >
            New Meeting
          </button>
        ) : (
          <>
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`px-6 sm:px-8 py-3 rounded-full text-sm font-medium transition-all ${
                isRecording
                  ? "bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30"
                  : "bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30"
              }`}
            >
              <span className="flex items-center gap-2">
                {isRecording && (
                  <span className="w-2 h-2 bg-red-500 rounded-full recording-dot" />
                )}
                {isRecording ? "Stop Recording" : "Start Recording"}
              </span>
            </button>
            {segments.length > 0 && !isRecording && (
              <button
                onClick={endMeeting}
                disabled={generatingSummary}
                className={`px-6 sm:px-8 py-3 rounded-full text-sm font-medium transition-all border ${
                  generatingSummary
                    ? "opacity-50 cursor-not-allowed bg-[var(--surface)] text-[var(--muted)] border-[var(--border)]"
                    : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30"
                }`}
              >
                {generatingSummary ? (
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                    Generating Summary...
                  </span>
                ) : (
                  "End Meeting"
                )}
              </button>
            )}
          </>
        )}
      </footer>

      {/* Bookmark FAB */}
      {!meetingEnded && (
        <BookmarkFAB onBookmark={addBookmark} disabled={segments.length === 0} />
      )}
    </div>
  );
}
