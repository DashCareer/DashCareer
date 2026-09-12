"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { Pause, Play, RotateCcw, TimerReset } from "lucide-react";
import { logStudySessionAction } from "@/app/actions";
import { subjects } from "@/lib/subjects";

type TimerState = {
  minutes: number;
  remaining: number;
  running: boolean;
  endAt: number | null;
  subject: string;
  cycles: number;
  sessionId: string;
};

type TimerContextValue = TimerState & {
  saving: boolean;
  setMinutes: (minutes: number) => void;
  setSubject: (subject: string) => void;
  toggle: () => void;
  reset: () => void;
};

const STORAGE_KEY = "dashcareer-study-timer-v2";
const LAST_LOGGED_KEY = "dashcareer-last-logged-timer";
const initialState: TimerState = { minutes: 25, remaining: 25 * 60, running: false, endAt: null, subject: "maths", cycles: 0, sessionId: "initial" };
const TimerContext = createContext<TimerContextValue | null>(null);

function freshId() { return `${Date.now()}-${Math.random().toString(36).slice(2)}`; }
function clock(seconds: number) { return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`; }

export function StudyTimerProvider({ children, signedIn }: { children: React.ReactNode; signedIn: boolean }) {
  const [state, setState] = useState<TimerState>(initialState);
  const [ready, setReady] = useState(false);
  const [saving, startTransition] = useTransition();
  const completing = useRef(false);

  useEffect(() => {
    const id = window.setTimeout(() => {
      try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null") as Partial<TimerState> | null;
        if (saved && typeof saved.minutes === "number" && typeof saved.remaining === "number") {
          const restored = { ...initialState, ...saved };
          if (restored.running && restored.endAt) restored.remaining = Math.max(0, Math.ceil((restored.endAt - Date.now()) / 1000));
          setState(restored);
        }
      } catch { /* Ignore damaged local data and use a clean timer. */ }
      setReady(true);
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [ready, state]);

  useEffect(() => {
    if (!ready || !state.running || !state.endAt) return;
    const update = () => setState((current) => current.running && current.endAt ? { ...current, remaining: Math.max(0, Math.ceil((current.endAt - Date.now()) / 1000)) } : current);
    update();
    const id = window.setInterval(update, 500);
    return () => window.clearInterval(id);
  }, [ready, state.running, state.endAt]);

  useEffect(() => {
    if (!ready || !state.running || state.remaining > 0 || completing.current) return;
    completing.current = true;
    const finished = state;
    setState((current) => ({ ...current, running: false, endAt: null, remaining: 0, cycles: current.cycles + 1 }));
    if (signedIn && localStorage.getItem(LAST_LOGGED_KEY) !== finished.sessionId) {
      localStorage.setItem(LAST_LOGGED_KEY, finished.sessionId);
      const data = new FormData(); data.set("subject", finished.subject); data.set("minutes", String(finished.minutes));
      startTransition(() => logStudySessionAction(data));
    }
    window.setTimeout(() => { completing.current = false; }, 1000);
  }, [ready, signedIn, state]);

  const value = useMemo<TimerContextValue>(() => ({
    ...state,
    saving,
    setMinutes(minutes) {
      setState((current) => ({ ...current, minutes, remaining: minutes * 60, running: false, endAt: null, sessionId: freshId() }));
    },
    setSubject(subject) { setState((current) => ({ ...current, subject })); },
    toggle() {
      setState((current) => current.running
        ? { ...current, running: false, endAt: null, remaining: Math.max(0, current.endAt ? Math.ceil((current.endAt - Date.now()) / 1000) : current.remaining) }
        : { ...current, running: true, endAt: Date.now() + current.remaining * 1000, sessionId: current.remaining === current.minutes * 60 ? freshId() : current.sessionId });
    },
    reset() { setState((current) => ({ ...current, remaining: current.minutes * 60, running: false, endAt: null, sessionId: freshId() })); },
  }), [saving, state]);

  const subjectName = subjects.find((item) => item.slug === state.subject)?.name ?? "Study session";
  return <TimerContext.Provider value={value}>{children}{ready && (state.running || state.remaining !== state.minutes * 60) && <aside className="floating-timer" aria-label="Active study timer"><span><TimerReset size={17} /><small>{subjectName}</small><b>{clock(state.remaining)}</b></span><button onClick={value.toggle} aria-label={state.running ? "Pause timer" : "Resume timer"}>{state.running ? <Pause size={16} /> : <Play size={16} />}</button><button onClick={value.reset} aria-label="Reset timer"><RotateCcw size={16} /></button></aside>}</TimerContext.Provider>;
}

export function useStudyTimer() {
  const value = useContext(TimerContext);
  if (!value) throw new Error("useStudyTimer must be used inside StudyTimerProvider");
  return value;
}
