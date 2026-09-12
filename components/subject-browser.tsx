"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { ArrowRight, Grid2X2, List, Pin, Search } from "lucide-react";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import type { Subject } from "@/lib/subjects";
import { Progress } from "@/components/ui/progress";

const symbols: Record<string, string> = { maths: "∑", "further-maths": "∫", physics: "⚛", chemistry: "⚗", biology: "⌬", "computer-science": "</>", history: "⌛", geography: "◎", economics: "↗", business: "◆", psychology: "Ψ", sociology: "◉", politics: "⚖", law: "§", french: "FR", spanish: "ES", german: "DE", "english-language": "Aa", "english-literature": "✦", "religious-studies": "◇", "art-design": "✎", "media-studies": "▶", "design-technology": "⌁", music: "♫", "drama-theatre": "◒", "physical-education": "⚡" };

type WebMCPContext = { registerTool?: (tool: Record<string, unknown>, options?: { signal?: AbortSignal }) => void | Promise<void> };
const groups: Record<string, string> = {
  maths: "STEM", "further-maths": "STEM", physics: "STEM", chemistry: "STEM", biology: "STEM", "computer-science": "STEM", "design-technology": "STEM",
  history: "Humanities", geography: "Humanities", economics: "Humanities", business: "Humanities", psychology: "Humanities", sociology: "Humanities", politics: "Humanities", law: "Humanities", "religious-studies": "Humanities",
  french: "Languages", spanish: "Languages", german: "Languages", "english-language": "Languages", "english-literature": "Languages",
  "art-design": "Creative", "media-studies": "Creative", music: "Creative", "drama-theatre": "Creative", "physical-education": "Creative",
};

function subscribePins(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("dashcareer-pins", callback);
  return () => { window.removeEventListener("storage", callback); window.removeEventListener("dashcareer-pins", callback); };
}

function getPinsSnapshot() { return localStorage.getItem("dashcareer-pins") || "[]"; }
function readPins(value: string) { try { return JSON.parse(value) as string[]; } catch { return []; } }
function savePins(pins: string[]) { localStorage.setItem("dashcareer-pins", JSON.stringify(pins)); window.dispatchEvent(new Event("dashcareer-pins")); }

export function SubjectBrowser({ subjects, progress = {} }: { subjects: Subject[]; progress?: Record<string, number> }) {
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState("All");
  const [view, setView] = useState<"grid" | "list">("grid");
  const pinsSnapshot = useSyncExternalStore(subscribePins, getPinsSnapshot, () => "[]");
  const pins = useMemo(() => readPins(pinsSnapshot), [pinsSnapshot]);
  const filtered = useMemo(() => subjects.filter((subject) => subject.name.toLowerCase().includes(query.toLowerCase().trim()) && (group === "All" || groups[subject.slug] === group)).sort((a, b) => Number(pins.includes(b.slug)) - Number(pins.includes(a.slug))), [query, group, subjects, pins]);
  function togglePin(slug: string) { savePins(pins.includes(slug) ? pins.filter((id) => id !== slug) : [...pins, slug]); }

  useEffect(() => {
    const context = (document as Document & { modelContext?: WebMCPContext }).modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    void Promise.resolve(context.registerTool({ name: "find_a_level_subjects", title: "Find A-Level subjects", description: "Filter the visible DashCareer subject library by subject name.", inputSchema: { type: "object", properties: { query: { type: "string", minLength: 1, maxLength: 80 } }, required: ["query"], additionalProperties: false }, annotations: { readOnlyHint: true, untrustedContentHint: false }, execute(input: unknown) { const value = typeof input === "object" && input && "query" in input ? String((input as { query: unknown }).query).trim().slice(0, 80) : ""; if (!value) throw new Error("A subject search is required."); setQuery(value); const matches = subjects.filter((subject) => subject.name.toLowerCase().includes(value.toLowerCase())); return { query: value, matches: matches.map((subject) => ({ name: subject.name, path: `/subjects/${subject.slug}` })) }; } }, { signal: lifecycle.signal })).catch(() => undefined);
    return () => lifecycle.abort();
  }, [subjects]);

  return (
    <section aria-labelledby="subject-library-title">
      <div className="section-heading subject-browser-head"><div><p className="eyebrow">Full library</p><h2 id="subject-library-title">Choose your subject</h2></div><div className="subject-tools"><label className="subject-search"><Search size={18} /><span className="sr-only">Search subjects</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search subjects" /></label><NativeSelect value={group} onChange={(event) => setGroup(event.target.value)} aria-label="Filter subject group"><NativeSelectOption>All</NativeSelectOption><NativeSelectOption>STEM</NativeSelectOption><NativeSelectOption>Humanities</NativeSelectOption><NativeSelectOption>Languages</NativeSelectOption><NativeSelectOption>Creative</NativeSelectOption></NativeSelect><div className="view-toggle" aria-label="Subject view"><button onClick={() => setView("grid")} aria-pressed={view === "grid"} title="Grid view"><Grid2X2 size={17} /></button><button onClick={() => setView("list")} aria-pressed={view === "list"} title="List view"><List size={18} /></button></div></div></div>
      <div className={`subject-grid ${view === "list" ? "list-view" : ""}`}>
        {filtered.map((subject) => <article className="subject-card" data-tilt key={subject.slug} style={{ "--subject-accent": subject.accent } as React.CSSProperties}><Link href={`/subjects/${subject.slug}`} aria-label={`Open ${subject.name}`}><span className="subject-card-art"><i /><span className="subject-icon">{symbols[subject.slug] ?? subject.short}</span></span><span className="subject-card-copy"><small className="subject-group">{groups[subject.slug]}</small><strong>{subject.name}</strong><small>{subject.topics.length} topic hubs · 6 boards</small><span className="subject-progress-line"><Progress value={progress[subject.slug] ?? 0} /><small>{progress[subject.slug] ?? 0}%</small></span><span className="subject-card-tags"><i>Notes</i><i>Practice</i><i>Progress</i></span></span><span className="subject-card-open">Explore <ArrowRight size={17} /></span></Link><button className={pins.includes(subject.slug) ? "pin active" : "pin"} onClick={() => togglePin(subject.slug)} aria-label={`${pins.includes(subject.slug) ? "Unpin" : "Pin"} ${subject.name}`} aria-pressed={pins.includes(subject.slug)}><Pin size={15} /></button></article>)}
      </div>
      {!filtered.length && <p className="empty-state">No subject matches those filters.</p>}
    </section>
  );
}

export function PinSubjectButton({ slug }: { slug: string }) {
  const pinsSnapshot = useSyncExternalStore(subscribePins, getPinsSnapshot, () => "[]");
  const values = useMemo(() => readPins(pinsSnapshot), [pinsSnapshot]);
  const pinned = values.includes(slug);
  function toggle() { savePins(pinned ? values.filter((id) => id !== slug) : [...values, slug]); }
  return <button type="button" onClick={toggle} aria-pressed={pinned}><Pin size={16} /> {pinned ? "Pinned" : "Pin subject"}</button>;
}
