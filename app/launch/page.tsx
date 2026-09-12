import type { Metadata } from "next";
import { CheckCircle2, CircleDashed, ExternalLink, Rocket, ShieldCheck } from "lucide-react";
import { getCurrentUser } from "@/app/auth-session";

export const metadata: Metadata = { title: "Launch readiness", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function LaunchPage() {
  const user = await getCurrentUser();
  const checks = [
    { title: "Learning platform", detail: "Diagnostics, reviews, original exam practice and progress storage are live.", done: true },
    { title: "Payment webhook", detail: "The secure receiver is live. Gumroad must be given its private notification address once.", done: Boolean(process.env.GUMROAD_WEBHOOK_URL) },
    { title: "Owner tools", detail: "The admin email controls access to payment and product-health information.", done: Boolean(process.env.DASHCAREER_ADMIN_EMAIL) },
    { title: "Advanced DashAI", detail: "Connect an approved AI endpoint and keep specification-linked evidence visible.", done: Boolean(process.env.DASH_AI_API_URL && process.env.DASH_AI_API_KEY && process.env.DASH_AI_MODEL) },
    { title: "Public access", detail: "DashCareer is deployed independently on Vercel with its own public address.", done: Boolean(process.env.VERCEL_PROJECT_PRODUCTION_URL) },
    { title: "Independent login", detail: "Email/password accounts use DashCareer branding and Supabase. LinkedIn sign-in requires a connected LinkedIn OIDC app.", done: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) },
    { title: "Curriculum verification", detail: "25 of 156 subject-board pathways are mapped; complete human review before claiming full coverage.", done: false },
  ];
  return <main className="shell page-space launch-page"><header className="launch-head"><span><Rocket /></span><div><p className="eyebrow">Owner checklist</p><h1>Prepare DashCareer for real students</h1><p>This page separates working product features from launch tasks that require your accounts, domain or human curriculum review.</p></div></header><div className="launch-progress"><b>{checks.filter((item) => item.done).length}/{checks.length} ready</b><i><span style={{ width: `${Math.round((checks.filter((item) => item.done).length / checks.length) * 100)}%` }} /></i></div><section className="launch-checklist">{checks.map((item) => <article className={item.done ? "done" : "pending"} key={item.title}>{item.done ? <CheckCircle2 /> : <CircleDashed />}<div><h2>{item.title}</h2><p>{item.detail}</p></div><span>{item.done ? "Ready" : "Action needed"}</span></article>)}</section>{!user && <div className="launch-note"><ShieldCheck /> Sign in to see account-specific launch status.</div>}<a className="official-domain-note" href="https://www.gov.uk/set-up-business" target="_blank" rel="noreferrer">UK business setup guidance <ExternalLink size={15} /></a></main>;
}
