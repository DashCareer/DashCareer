import Link from "next/link";
import { ArrowRight, CheckCircle2, Sparkles, Target } from "lucide-react";
import { SubjectBrowser } from "@/components/subject-browser";
import { subjects, totalTopics } from "@/lib/subjects";
import { getCurrentUser, signInPath } from "@/app/auth-session";
import { FaqModule } from "@/components/faq-module";
import { FounderCard } from "@/components/founder-card";

export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await getCurrentUser();
  return (
    <main>
      <section className="hero shell">
        <div className="hero-copy">
          <p className="eyebrow"><Sparkles size={14} /> Built for UK A-Level students</p>
          <h1>Stop collecting resources.<br /><em>Start finishing topics.</em></h1>
          <p>Revision notes, original exam practice and a progress dashboard—organised into one focused study flow.</p>
          <div className="hero-actions">
            <Link className="button primary" href="/subjects">Explore subjects <ArrowRight size={18} /></Link>
            {user ? <Link className="button secondary" href="/dashboard">Continue studying</Link> : <a className="button secondary" href={signInPath("/dashboard")} target="_top">Sign in to save progress</a>}
          </div>
          <div className="trust-row"><span><CheckCircle2 size={16} /> {subjects.length} subjects</span><span><CheckCircle2 size={16} /> {totalTopics} mapped areas</span><span><CheckCircle2 size={16} /> Original practice</span></div>
        </div>
        <aside className="today-card" data-tilt aria-label="Study flow preview">
          <div className="today-top"><span>Today&apos;s focus</span><Target size={22} /></div>
          <h2>Build momentum in 20 minutes</h2>
          <ol><li><b>01</b><span>Read the topic summary<small>5 minutes</small></span></li><li><b>02</b><span>Attempt the question<small>10 minutes</small></span></li><li><b>03</b><span>Check and mark complete<small>5 minutes</small></span></li></ol>
          <Link href="/subjects/maths">Start with Mathematics <ArrowRight size={17} /></Link>
        </aside>
      </section>
      <div className="shell home-library"><SubjectBrowser subjects={subjects.slice(0, 8)} /><div className="all-subjects-link"><Link href="/subjects">View all {subjects.length} subjects <ArrowRight size={18} /></Link></div></div>
      <section className="how-strip"><div className="shell how-grid"><div><p className="eyebrow">A simple loop</p><h2>Learn. Practise. Track.</h2></div><p>Every topic begins with a concise revision focus, then gives you an original exam-style question and mark guidance. Mark it complete and your dashboard updates.</p><Link href="/dashboard">Open dashboard <ArrowRight size={18} /></Link></div></section>
      <section className="shell coverage-cta"><div><p className="eyebrow">Curriculum map</p><h2>Pick your subject and exam board.</h2><p>Browse mapped topic areas, detailed learning packs and direct links to the current official specifications.</p></div><Link className="button secondary" href="/coverage">See specification coverage <ArrowRight size={17} /></Link></section>
      <section className="shell home-faq"><FaqModule compact /><div className="all-subjects-link"><Link href="/faq">Open the complete help centre <ArrowRight size={18} /></Link></div></section>
      <div className="shell founder-home"><FounderCard /></div>
    </main>
  );
}
