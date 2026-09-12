"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { BellRing, Moon, Palette, Pause, Play, RotateCcw, Sun, TimerReset, Zap } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { subjects } from "@/lib/subjects";
import { useStudyTimer } from "@/components/study-timer-provider";

const themes = [
  { id: "light", label: "Light", icon: Sun },
  { id: "dark", label: "Dark", icon: Moon },
  { id: "midnight", label: "Midnight", icon: Palette },
];

function subscribeTheme(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("dashcareer-theme", callback);
  return () => { window.removeEventListener("storage", callback); window.removeEventListener("dashcareer-theme", callback); };
}

function getTheme() { return localStorage.getItem("dashcareer-theme") || "light"; }

export function StudyControls({ compact = false }: { compact?: boolean }) {
  const theme = useSyncExternalStore(subscribeTheme, getTheme, () => "light");
  const [focus, setFocus] = useState(false);
  const timer = useStudyTimer();

  useEffect(() => {
    document.body.classList.toggle("focus-mode", focus);
    return () => document.body.classList.remove("focus-mode");
  }, [focus]);
  function chooseTheme(next: string) { localStorage.setItem("dashcareer-theme", next); window.dispatchEvent(new Event("dashcareer-theme")); }
  const clock = `${String(Math.floor(timer.remaining / 60)).padStart(2, "0")}:${String(timer.remaining % 60).padStart(2, "0")}`;

  return (
    <section className={compact ? "study-controls compact" : "study-controls"} aria-label="Study controls">
      <div className="control-card pomodoro-card"><div className="control-title"><span><TimerReset size={18} /> Pomodoro</span><small>{timer.saving ? "Saving…" : `${timer.cycles} cycles`}</small></div><div className="timer-clock" aria-live="polite">{clock}</div><div className="timer-options">{[15,25,45].map((value) => <button key={value} className={timer.minutes === value ? "active" : ""} onClick={() => timer.setMinutes(value)}>{value}m</button>)}</div><select aria-label="Timer subject" value={timer.subject} onChange={(event) => timer.setSubject(event.target.value)}>{subjects.map((item) => <option value={item.slug} key={item.slug}>{item.name}</option>)}</select><div className="timer-actions"><button className="button primary" onClick={timer.toggle}>{timer.running ? <Pause size={17} /> : <Play size={17} />}{timer.running ? "Pause" : timer.remaining < timer.minutes * 60 ? "Resume" : "Start"}</button><button className="icon-button" aria-label="Reset timer" onClick={timer.reset}><RotateCcw size={17} /></button></div>{timer.cycles > 0 && timer.cycles % 2 === 0 && <p className="wellbeing-note"><BellRing size={15} /> Two sessions done. Step away briefly, drink some water and rest your eyes.</p>}</div>
      <div className="control-card display-card"><div className="control-title"><span><Palette size={18} /> Appearance</span></div><div className="theme-choices">{themes.map(({ id, label, icon: Icon }) => <button key={id} className={theme === id ? "active" : ""} onClick={() => chooseTheme(id)}><Icon size={16} /> {label}</button>)}</div><label className="focus-toggle"><span><Zap size={17} /> Focus mode<small>Hide navigation and distractions</small></span><Switch checked={focus} onCheckedChange={setFocus} aria-label="Toggle focus mode" /></label></div>
    </section>
  );
}
