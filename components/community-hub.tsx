"use client";

import { Clock3, DoorOpen, ShieldCheck, Users } from "lucide-react";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { submitCommunityPostAction } from "@/app/actions";
import { subjects } from "@/lib/subjects";
import type { CommunityRow } from "@/db/queries";
import { COMMUNITY_ROOMS, useCommunityPresence } from "@/components/community-presence-provider";

export function CommunityHub({ posts }: { posts: CommunityRow[] }) {
  const community = useCommunityPresence();
  return (
    <div className="community-layout">
      <div className="community-main">
        <section className="tool-panel community-room-panel">
          <div className="panel-heading">
            <div><p className="tool-kicker"><Users size={16} /> Shared study rooms</p><h2>Focus together, quietly</h2></div>
            <span className="safety-pill"><ShieldCheck size={15} /> Persistent & private</span>
          </div>
          <div className="room-grid">
            {COMMUNITY_ROOMS.map((room) => (
              <article className={community.joined === room.name ? "joined" : ""} key={room.name}>
                <div className="room-icon"><Users /></div><h3>{room.name}</h3><p>{room.subject}</p><span><Clock3 size={15} /> {room.minutes} minutes</span>
                <button className={community.joined === room.name ? "button secondary" : "button primary"} onClick={() => community.toggleRoom(room.name)}>
                  {community.joined === room.name ? "Leave room" : <><DoorOpen size={16} /> Join room</>}
                </button>
              </article>
            ))}
          </div>
          {community.joined && <div className="room-active"><span className="live-dot" /> You&apos;re studying in <b>{community.joined}</b>. It stays active while you use other DashCareer pages.</div>}
        </section>
        <section className="tool-panel">
          <p className="tool-kicker">Peer notes & discussion</p><h2>Approved community posts</h2>
          {posts.length ? <div className="community-posts">{posts.map((post) => <article key={post.id}><span>{post.kind === "peer-note" ? "Peer note" : "Discussion"} · {subjects.find((item) => item.slug === post.subject_slug)?.name}</span><p>{post.body}</p><small>{post.display_name}</small></article>)}</div> : <div className="empty-state"><h3>No approved posts yet.</h3><p>New contributions are checked before they become visible.</p></div>}
        </section>
      </div>
      <aside className="tool-panel community-form">
        <p className="tool-kicker">Contribute safely</p><h2>Share with students</h2>
        <form action={submitCommunityPostAction} className="stack-form">
          <label>Subject<NativeSelect name="subject" value={community.draftSubject} onChange={(event) => community.setDraftSubject(event.target.value)}>{subjects.map((subject) => <NativeSelectOption value={subject.slug} key={subject.slug}>{subject.name}</NativeSelectOption>)}</NativeSelect></label>
          <label>Post type<NativeSelect name="kind" value={community.draftKind} onChange={(event) => community.setDraftKind(event.target.value === "discussion" ? "discussion" : "peer-note")}><NativeSelectOption value="peer-note">Peer note</NativeSelectOption><NativeSelectOption value="discussion">Discussion</NativeSelectOption></NativeSelect></label>
          <label>Your contribution<Textarea name="body" value={community.draft} onChange={(event) => community.setDraft(event.target.value)} minLength={20} maxLength={500} required placeholder="Share a study tip, explanation or useful question…" /></label>
          <small className="draft-saved">Draft and room stay available while you move around the site.</small>
          <button className="button primary" type="submit">Submit for review</button>
        </form>
        <div className="community-rules"><b><ShieldCheck size={16} /> Privacy controls</b><ul><li>No contact details, usernames or external links</li><li>Posts use a first name only</li><li>Everything is moderated before publishing</li><li>Use the platform for study, not personal chat</li></ul></div>
      </aside>
    </div>
  );
}
