"use client";

import { useEffect, useRef, useState } from "react";
import { Headphones, Music2, Pause, Play, Sparkles, X } from "lucide-react";
import { useStudyTimer } from "@/components/study-timer-provider";
import { subjects } from "@/lib/subjects";

export function StudyRoomMode() {
  const timer = useStudyTimer();
  const [open, setOpen] = useState(false);
  const [sound, setSound] = useState(false);
  const audio = useRef<{ context: AudioContext; nodes: OscillatorNode[] } | null>(null);

  useEffect(() => {
    document.body.classList.toggle("study-room-active", open);
    return () => document.body.classList.remove("study-room-active");
  }, [open]);
  useEffect(() => () => { audio.current?.nodes.forEach((node) => node.stop()); void audio.current?.context.close(); }, []);

  function toggleSound() {
    if (audio.current) {
      audio.current.nodes.forEach((node) => node.stop());
      void audio.current.context.close();
      audio.current = null;
      setSound(false);
      return;
    }
    const AudioContextClass = window.AudioContext;
    const context = new AudioContextClass();
    const master = context.createGain();
    master.gain.value = 0.018;
    master.connect(context.destination);
    const nodes = [174, 261.6, 392].map((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = index === 0 ? "sine" : "triangle";
      oscillator.frequency.value = frequency;
      gain.gain.value = index === 0 ? 0.7 : 0.15;
      oscillator.connect(gain).connect(master);
      oscillator.start();
      return oscillator;
    });
    audio.current = { context, nodes };
    setSound(true);
  }
  function close() { setOpen(false); if (audio.current) toggleSound(); }
  const clock = `${String(Math.floor(timer.remaining / 60)).padStart(2, "0")}:${String(timer.remaining % 60).padStart(2, "0")}`;
  const currentSubject = subjects.find((item) => item.slug === timer.subject)?.name ?? "Independent study";

  return <>
    {!open && <button className="study-room-launch" type="button" onClick={() => setOpen(true)}><Headphones size={18} /><span>Study room</span></button>}
    {open && <aside className="study-room-overlay" aria-label="Distraction-free study room">
      <div className="study-room-ambience" aria-hidden="true">{Array.from({ length: 14 }, (_, index) => <i key={index} />)}</div>
      <button className="study-room-close" onClick={close} aria-label="Leave study room"><X /></button>
      <div className="study-room-console"><p><Sparkles size={15} /> Focus space</p><h2>{currentSubject}</h2><div className="study-room-clock">{clock}</div><small>{timer.running ? "Stay with one clear task." : "Settle in, then begin when you are ready."}</small><div className="study-room-actions"><button className="room-play" onClick={timer.toggle}>{timer.running ? <Pause /> : <Play />}{timer.running ? "Pause" : "Start focus"}</button><button className={sound ? "room-sound active" : "room-sound"} onClick={toggleSound}><Music2 />{sound ? "Ambient sound on" : "Ambient sound"}</button></div><div className="study-room-presets">{[15,25,45].map((minutes) => <button className={timer.minutes === minutes ? "active" : ""} onClick={() => timer.setMinutes(minutes)} key={minutes}>{minutes} min</button>)}</div></div>
    </aside>}
  </>;
}
