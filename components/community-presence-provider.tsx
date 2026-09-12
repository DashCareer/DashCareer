"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { DoorOpen, ExternalLink, MessageCircle, Minus, Send, ShieldCheck, Users, X } from "lucide-react";
import type { CommunityRow } from "@/db/queries";
import { subjects } from "@/lib/subjects";

export const COMMUNITY_ROOMS = [
  { name: "Quiet 25", subject: "Independent focus", minutes: 25 },
  { name: "STEM Sprint", subject: "Maths & sciences", minutes: 45 },
  { name: "Essay Hour", subject: "Humanities & languages", minutes: 50 },
] as const;

type CommunityState = {
  joined: string | null;
  joinedAt: number | null;
  draft: string;
  draftSubject: string;
  draftKind: "peer-note" | "discussion";
  panelOpen: boolean;
};

type CommunityContextValue = CommunityState & {
  setDraft: (value: string) => void;
  setDraftSubject: (value: string) => void;
  setDraftKind: (value: "peer-note" | "discussion") => void;
  setPanelOpen: (value: boolean) => void;
  toggleRoom: (name: string) => void;
  leaveRoom: () => void;
};

const STORAGE_KEY = "dashcareer-community-presence-v1";
const SCROLL_KEY = "dashcareer-community-scroll-v1";
const initialState: CommunityState = { joined: null, joinedAt: null, draft: "", draftSubject: "maths", draftKind: "peer-note", panelOpen: false };
const CommunityContext = createContext<CommunityContextValue | null>(null);

function elapsedLabel(joinedAt: number | null, now: number) {
  if (!joinedAt) return "Ready to focus";
  const minutes = Math.max(0, Math.floor((now - joinedAt) / 60000));
  return minutes < 1 ? "Just joined" : `${minutes} min active`;
}

export function CommunityPresenceProvider({ children, signedIn, currentUserName, initialPosts }: { children: React.ReactNode; signedIn: boolean; currentUserName: string; initialPosts: CommunityRow[] }) {
  const pathname = usePathname();
  const [state, setState] = useState<CommunityState>(initialState);
  const [ready, setReady] = useState(false);
  const [now, setNow] = useState(0);
  const [people, setPeople] = useState<Array<{ display_name: string; room: string | null }>>([]);

  const heartbeat = useCallback(async (room: string | null) => {
    if (!signedIn) return;
    try {
      const response = await fetch("/api/community/presence", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ room }) });
      if (response.ok) setPeople((await response.json() as { people: Array<{ display_name: string; room: string | null }> }).people);
    } catch { /* Presence is supplementary; the rest of Community stays usable. */ }
  }, [signedIn]);

  useEffect(() => {
    const id = window.setTimeout(() => {
      try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null") as Partial<CommunityState> | null;
        if (saved) setState((current) => ({ ...current, ...saved, panelOpen: Boolean(saved.panelOpen) }));
      } catch { /* Use a clean community state when local data is damaged. */ }
      setNow(Date.now());
      setReady(true);
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [ready, state]);

  useEffect(() => {
    if (!state.joined) return;
    const timer = window.setInterval(() => setNow(Date.now()), 15000);
    return () => window.clearInterval(timer);
  }, [state.joined]);

  useEffect(() => {
    if (!signedIn) return;
    const initial = window.setTimeout(() => void heartbeat(state.joined), 0);
    const timer = window.setInterval(() => void heartbeat(state.joined), 30000);
    return () => { window.clearTimeout(initial); window.clearInterval(timer); };
  }, [heartbeat, signedIn, state.joined]);

  useEffect(() => {
    if (pathname !== "/community") return;
    const restore = window.setTimeout(() => {
      const saved = Number(sessionStorage.getItem(SCROLL_KEY) || 0);
      if (saved > 0) window.scrollTo({ top: saved, behavior: "auto" });
    }, 0);
    const remember = () => sessionStorage.setItem(SCROLL_KEY, String(window.scrollY));
    window.addEventListener("scroll", remember, { passive: true });
    return () => {
      window.clearTimeout(restore);
      remember();
      window.removeEventListener("scroll", remember);
    };
  }, [pathname]);

  const value = useMemo<CommunityContextValue>(() => ({
    ...state,
    setDraft: (draft) => setState((current) => ({ ...current, draft })),
    setDraftSubject: (draftSubject) => setState((current) => ({ ...current, draftSubject })),
    setDraftKind: (draftKind) => setState((current) => ({ ...current, draftKind })),
    setPanelOpen: (panelOpen) => setState((current) => ({ ...current, panelOpen })),
    toggleRoom: (name) => setState((current) => current.joined === name
      ? { ...current, joined: null, joinedAt: null }
      : { ...current, joined: name, joinedAt: Date.now(), panelOpen: true }),
    leaveRoom: () => setState((current) => ({ ...current, joined: null, joinedAt: null })),
  }), [state]);

  return (
    <CommunityContext.Provider value={value}>
      {children}
      {ready && signedIn && (
        <aside className={`community-dock ${state.panelOpen ? "expanded" : ""} ${pathname === "/community" ? "on-community" : ""}`} aria-label="Persistent community space">
          {state.panelOpen ? (
            <div className="community-dock-panel">
              <div className="community-dock-head">
                <span className="community-dock-icon"><Users size={18} /></span>
                <span><b>Community space</b><small>{state.joined ? elapsedLabel(state.joinedAt, now) : "Choose a study room"}</small></span>
                <button onClick={() => value.setPanelOpen(false)} aria-label="Minimise community"><Minus size={17} /></button>
              </div>
              <div className="presence-strip"><span><i /> {people.length || 1} online now</span><div>{(people.length ? people : [{ display_name: currentUserName || "You", room: state.joined }]).slice(0, 5).map((person, index) => <i key={`${person.display_name}:${index}`} title={`${person.display_name}${person.room ? ` · ${person.room}` : ""}`}>{person.display_name.slice(0, 1).toUpperCase()}</i>)}</div></div>
              {state.joined ? (
                <div className="community-dock-room"><span className="live-dot" /><div><b>{state.joined}</b><small>Stays active while you browse</small></div><button onClick={value.leaveRoom}>Leave</button></div>
              ) : (
                <div className="community-dock-rooms">{COMMUNITY_ROOMS.map((room) => <button key={room.name} onClick={() => value.toggleRoom(room.name)}><DoorOpen size={15} /><span><b>{room.name}</b><small>{room.minutes} min</small></span></button>)}</div>
              )}
              <div className="community-mini-feed">
                <div className="community-mini-title"><span><MessageCircle size={15} /> Latest approved posts</span><small>Moderated</small></div>
                {initialPosts.slice(0, 3).map((post) => <article key={post.id}><span className="community-mini-avatar">{post.display_name.slice(0, 1).toUpperCase()}</span><div><b>{post.display_name} · {subjects.find((item) => item.slug === post.subject_slug)?.short ?? "Study"}</b><p>{post.body}</p></div></article>)}
                {!initialPosts.length && <p className="community-mini-empty">No approved posts yet. Start a draft below.</p>}
              </div>
              <label className="community-mini-composer"><span className="sr-only">Community draft</span><textarea value={state.draft} onChange={(event) => value.setDraft(event.target.value)} maxLength={500} placeholder="Write a study note or question…" /><Link href="/community" aria-label="Continue and submit this draft"><Send size={15} /></Link></label>
              {state.draft && <div className="community-draft-status"><MessageCircle size={15} /><span><b>Draft saved across pages</b><small>{state.draft.length}/500 characters</small></span></div>}
              <div className="community-dock-actions"><span><ShieldCheck size={14} /> Moderated & private</span><Link href="/community">Open Community <ExternalLink size={14} /></Link></div>
            </div>
          ) : (
            <button className="community-dock-launch" onClick={() => value.setPanelOpen(true)} aria-label="Open persistent community">
              <span><Users size={19} /></span><b>{state.joined ?? "Community"}</b>{state.joined && <i className="live-dot" />}<ExternalLink size={15} />
            </button>
          )}
          {state.panelOpen && <button className="community-dock-close" onClick={() => value.setPanelOpen(false)} aria-label="Close community panel"><X size={15} /></button>}
        </aside>
      )}
    </CommunityContext.Provider>
  );
}

export function useCommunityPresence() {
  const value = useContext(CommunityContext);
  if (!value) throw new Error("useCommunityPresence must be used inside CommunityPresenceProvider");
  return value;
}
