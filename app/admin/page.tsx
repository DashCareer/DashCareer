import type { Metadata } from "next";
import Link from "next/link";
import { Activity, AlertTriangle, BarChart3, BookOpenCheck, CreditCard, ShieldCheck, Users } from "lucide-react";
import { requireUser } from "@/app/auth-session";
import { getAdminMetrics, listRecentPaymentEvents } from "@/db/queries";
import { subjects } from "@/lib/subjects";
import { examBoards } from "@/lib/exam-boards";
import { getBoardCurriculum } from "@/lib/board-curricula";

export const metadata: Metadata = { title: "Admin overview", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await requireUser("/admin");
  const adminEmail = process.env.DASHCAREER_ADMIN_EMAIL?.trim().toLowerCase();
  if (!adminEmail || user.email.toLowerCase() !== adminEmail) return <main className="shell page-space"><div className="admin-locked"><ShieldCheck /><h1>Owner access only</h1><p>Set the DashCareer admin email in the private site settings to open this area.</p></div></main>;
  const [metrics, payments] = await Promise.all([getAdminMetrics().catch(() => ({ users: 0, diagnostics: 0, unresolvedErrors: 0, sessions: 0, events: [] })), listRecentPaymentEvents().catch(() => [])]);
  const mapped = subjects.reduce((sum, subject) => sum + examBoards.filter((board) => getBoardCurriculum(subject, board.id).status === "board-mapped").length, 0);
  return <main className="shell page-space admin-page"><header className="admin-head"><div><p className="eyebrow"><ShieldCheck size={14} /> Owner workspace</p><h1>DashCareer control room</h1><p>Product health, learning gaps and launch readiness in one private view.</p></div><Link className="button secondary" href="/launch">Launch checklist</Link></header><section className="admin-metrics"><article><Users /><b>{metrics.users}</b><span>tracked learners</span></article><article><Activity /><b>{metrics.sessions}</b><span>focus sessions</span></article><article><BarChart3 /><b>{metrics.diagnostics}</b><span>diagnostics</span></article><article><AlertTriangle /><b>{metrics.unresolvedErrors}</b><span>open mistakes</span></article></section><div className="admin-grid"><section className="admin-panel"><div className="panel-heading"><div><p className="tool-kicker"><BookOpenCheck size={16} /> Curriculum</p><h2>Specification coverage</h2></div><span>{mapped}/156</span></div><div className="coverage-meter"><i style={{ width: `${Math.round((mapped / 156) * 100)}%` }} /></div><p>{156 - mapped} subject-board combinations remain honestly labelled as cross-board until reviewed.</p><Link href="/coverage">Open coverage report</Link></section><section className="admin-panel"><div className="panel-heading"><div><p className="tool-kicker"><CreditCard size={16} /> Payments</p><h2>Recent membership events</h2></div><span>{payments.length}</span></div>{payments.length ? <div className="admin-events">{payments.map((event) => <div key={event.event_key}><span>{event.plan}</span><b>{event.status}</b><small>{event.event_name}</small></div>)}</div> : <p>No payment events have reached the webhook yet.</p>}</section><section className="admin-panel"><div className="panel-heading"><div><p className="tool-kicker"><BarChart3 size={16} /> Usage</p><h2>Most-used actions</h2></div></div>{metrics.events.length ? <div className="admin-event-bars">{metrics.events.map((event) => <div key={event.label}><span>{event.label.replace(/_/g, " ")}</span><i><b style={{ width: `${Math.min(100, event.value * 10)}%` }} /></i><strong>{event.value}</strong></div>)}</div> : <p>Usage begins recording after signed-in navigation.</p>}</section></div></main>;
}
