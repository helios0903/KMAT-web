# KMAT — Project Map

## Module Index (for targeted edits — read only what you need)

### ASR (Speech-to-Text)
- `app/page.tsx` lines 35-50 (refs: mediaRecorder, WebSocket, stream, fragment buffer)
- `app/page.tsx` startRecording (~line 150) — Deepgram Nova-2 WebSocket streaming
- `app/page.tsx` stopRecording / cleanupRecording (~line 260)
- `app/api/deepgram/route.ts` — returns Deepgram API key to client

### Translation
- `app/page.tsx` translateText (~line 97) — calls /api/translate with glossary + targetLang
- `app/page.tsx` handleFinalResult (~line 130) — fragment buffer before translation
- `app/api/translate/route.ts` — Claude Haiku, accepts glossary array, injects into prompt

### Meeting Lifecycle
- `app/page.tsx` startRecording — creates meeting metadata
- `app/page.tsx` endMeeting (~line 290) — stops recording, generates summary, navigates to /summary
- `app/page.tsx` newMeeting — resets state

### Storage (localStorage)
- `app/lib/storage.ts` — all persistence functions
  - Meeting: `saveMeeting`, `loadMeeting`, `clearMeeting`, `saveSegments`, `saveBookmarks`, `saveSummary`
  - Glossary: `saveGlossary`, `loadGlossary` (key: `kmat_glossary`)
  - Settings: `saveSettings`, `loadSettings` (key: `kmat_settings`)

### Types
- `app/types.ts` — TranslationSegment, Bookmark, MeetingMetadata, MeetingSummary, MeetingData, GlossaryTerm, AppSettings

### Pages (UI — read only if modifying UI)
- `app/page.tsx` — Meeting page (ASR + translation + bookmarks) — JSX starts ~line 315
- `app/transcript/page.tsx` — Transcript viewer
- `app/bookmarks/page.tsx` — Bookmark filter/list
- `app/summary/page.tsx` — AI summary display + markdown export
- `app/glossary/page.tsx` — Term management (add/delete)
- `app/settings/page.tsx` — Language, font size, theme toggle

### Components (UI — read only if modifying UI)
- `app/components/NavHeader.tsx` — Nav bar with 6 links, recording glow
- `app/components/BookmarkFAB.tsx` — Floating bookmark buttons
- `app/components/BookmarkBadge.tsx` — Bookmark type icon
- `app/components/SummaryCard.tsx` — Summary section card
- `app/components/ThemeProvider.tsx` — Sets data-theme on html element

### Styling
- `app/globals.css` — CSS variables (dark/light theme), recording animation
- `app/layout.tsx` — Root layout, wraps ThemeProvider

### API Routes
- `app/api/translate/route.ts` — POST {text, targetLang, glossary?} → {translation}
- `app/api/summary/route.ts` — POST {segments, bookmarks} → {summary}
- `app/api/deepgram/route.ts` — GET → {key}

## Tech Stack
- Next.js 14 (App Router), TypeScript, Tailwind CSS
- Anthropic Claude 3 Haiku (translation + summary)
- Deepgram Nova-2 (Korean ASR via WebSocket streaming)
- localStorage for persistence

## Conventions
- All pages use `"use client"` directive
- Theme: CSS variables `--background`, `--foreground`, `--surface`, `--border`, `--muted`
- Responsive: `px-4 sm:px-8`, mobile-first
- API keys in `.env.local` (never commit)
