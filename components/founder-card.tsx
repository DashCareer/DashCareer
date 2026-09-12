import { ArrowUpRight, ShieldCheck, Sparkles } from "lucide-react";

function LinkedInIcon() { return <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M5.4 8.9H2.1V19h3.3V8.9ZM3.8 4a1.9 1.9 0 1 0 0 3.8A1.9 1.9 0 0 0 3.8 4Zm7 4.9H7.7V19H11v-5c0-1.3.2-2.6 1.9-2.6 1.6 0 1.7 1.5 1.7 2.7V19h3.3v-5.5c0-2.7-.6-4.9-3.9-4.9-1.6 0-2.6.9-3 1.7h-.1V8.9Z" /></svg>; }

export function FounderCard() {
  return <section className="founder-card" aria-labelledby="founder-title">
    <div className="founder-portrait" role="img" aria-label="Cagdas Ozturk profile placeholder"><span>CO</span><i><LinkedInIcon /></i></div>
    <div className="founder-copy"><p className="eyebrow"><Sparkles size={14} /> Founder spotlight</p><h2 id="founder-title">Cagdas Ozturk</h2><strong>Founder / Creator</strong><p>Building a clearer, more focused route through A-Level revision.</p><span><ShieldCheck size={15} /> Official DashCareer profile</span></div>
    <div className="founder-action"><a className="linkedin-link" href="https://www.linkedin.com/in/cagdas-ozturk-3b9095372/" target="_blank" rel="noreferrer"><LinkedInIcon /> View LinkedIn <ArrowUpRight size={17} /></a><small>Professional profile</small></div>
  </section>;
}
