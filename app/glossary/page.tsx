"use client";

import { useState, useEffect } from "react";
import { GlossaryTerm } from "../types";
import { loadGlossary, saveGlossary } from "../lib/storage";
import NavHeader from "../components/NavHeader";

export default function GlossaryPage() {
  const [terms, setTerms] = useState<GlossaryTerm[]>([]);
  const [korean, setKorean] = useState("");
  const [translation, setTranslation] = useState("");

  useEffect(() => {
    setTerms(loadGlossary());
  }, []);

  const addTerm = () => {
    const k = korean.trim();
    const t = translation.trim();
    if (!k || !t) return;

    const next = [
      ...terms,
      { id: crypto.randomUUID(), korean: k, translation: t },
    ];
    setTerms(next);
    saveGlossary(next);
    setKorean("");
    setTranslation("");
  };

  const deleteTerm = (id: string) => {
    const next = terms.filter((t) => t.id !== id);
    setTerms(next);
    saveGlossary(next);
  };

  return (
    <div className="flex flex-col h-screen bg-[var(--background)] text-[var(--foreground)]">
      <NavHeader />

      <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="text-xl font-semibold">
            Glossary
            <span className="text-sm font-normal text-[var(--muted)] ml-2">
              {terms.length} terms
            </span>
          </h2>

          {/* Add form */}
          <div className="flex gap-2">
            <input
              value={korean}
              onChange={(e) => setKorean(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTerm()}
              placeholder="Korean term"
              className="flex-1 px-3 py-2 rounded border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] text-sm placeholder:text-[var(--muted)] focus:outline-none focus:border-blue-500/50"
            />
            <input
              value={translation}
              onChange={(e) => setTranslation(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTerm()}
              placeholder="Translation"
              className="flex-1 px-3 py-2 rounded border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] text-sm placeholder:text-[var(--muted)] focus:outline-none focus:border-blue-500/50"
            />
            <button
              onClick={addTerm}
              disabled={!korean.trim() || !translation.trim()}
              className="px-4 py-2 rounded text-sm font-medium transition-colors bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Add
            </button>
          </div>

          {/* Term list */}
          {terms.length === 0 ? (
            <div className="text-center py-12 text-[var(--muted)] text-sm">
              No glossary terms yet. Add domain-specific terms above to improve translation accuracy.
            </div>
          ) : (
            <div className="rounded-lg border border-[var(--border)] overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--surface)]">
                    <th className="text-left px-4 py-2.5 font-medium text-[var(--muted)]">Korean</th>
                    <th className="text-left px-4 py-2.5 font-medium text-[var(--muted)]">Translation</th>
                    <th className="w-16" />
                  </tr>
                </thead>
                <tbody>
                  {terms.map((term) => (
                    <tr
                      key={term.id}
                      className="border-b border-[var(--border)] last:border-b-0 hover:bg-[var(--surface)] transition-colors"
                    >
                      <td className="px-4 py-2.5">{term.korean}</td>
                      <td className="px-4 py-2.5">{term.translation}</td>
                      <td className="px-4 py-2.5 text-center">
                        <button
                          onClick={() => deleteTerm(term.id)}
                          className="text-red-400/60 hover:text-red-400 transition-colors text-xs"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
