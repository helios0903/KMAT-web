"use client";

import { useState, useEffect } from "react";
import { AppSettings } from "../types";
import { loadSettings, saveSettings } from "../lib/storage";
import NavHeader from "../components/NavHeader";

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings | null>(null);

  useEffect(() => {
    setSettings(loadSettings());
  }, []);

  const update = (patch: Partial<AppSettings>) => {
    if (!settings) return;
    const next = { ...settings, ...patch };
    setSettings(next);
    saveSettings(next);

    if (patch.theme) {
      document.documentElement.setAttribute("data-theme", patch.theme);
      window.dispatchEvent(new Event("theme-changed"));
    }
  };

  if (!settings) return null;

  return (
    <div className="flex flex-col h-screen bg-[var(--background)] text-[var(--foreground)]">
      <NavHeader />

      <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-6">
        <div className="max-w-lg mx-auto space-y-8">
          <h2 className="text-xl font-semibold">Settings</h2>

          {/* Target Language */}
          <section className="space-y-3">
            <label className="text-sm text-[var(--muted)]">Target Language</label>
            <div className="flex gap-2">
              {([
                { value: "zh-CN" as const, label: "简体中文" },
                { value: "en" as const, label: "English" },
              ]).map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => update({ targetLang: opt.value })}
                  className={`px-4 py-2 rounded text-sm font-medium transition-colors border ${
                    settings.targetLang === opt.value
                      ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                      : "bg-[var(--surface)] text-[var(--muted)] border-[var(--border)] hover:text-[var(--foreground)]"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </section>

          {/* Font Size */}
          <section className="space-y-3">
            <label className="text-sm text-[var(--muted)]">
              Translation Font Size: {settings.fontSize}px
            </label>
            <input
              type="range"
              min={20}
              max={40}
              value={settings.fontSize}
              onChange={(e) => update({ fontSize: Number(e.target.value) })}
              className="w-full accent-blue-500"
            />
            <p
              className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 leading-relaxed"
              style={{ fontSize: `${settings.fontSize}px` }}
            >
              翻译文字预览 / Translation preview
            </p>
          </section>

          {/* Theme */}
          <section className="space-y-3">
            <label className="text-sm text-[var(--muted)]">Theme</label>
            <div className="flex gap-2">
              {([
                { value: "dark" as const, label: "Dark" },
                { value: "light" as const, label: "Light" },
              ]).map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => update({ theme: opt.value })}
                  className={`px-4 py-2 rounded text-sm font-medium transition-colors border ${
                    settings.theme === opt.value
                      ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                      : "bg-[var(--surface)] text-[var(--muted)] border-[var(--border)] hover:text-[var(--foreground)]"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
