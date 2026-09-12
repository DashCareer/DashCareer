import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, HelpCircle } from "lucide-react";
import { FaqModule } from "@/components/faq-module";

export const metadata: Metadata = { title: "Help & FAQ", description: "Answers about DashCareer study tools, accounts, privacy and membership." };

export default function FaqPage() {
  return <main className="shell page-space faq-page"><div className="page-intro faq-intro"><p className="eyebrow"><HelpCircle size={15} /> Help centre</p><h1>Answers without the wait.</h1><p>Find clear information about studying, saved work, privacy and membership.</p></div><div className="faq-layout"><FaqModule /><aside className="faq-assistant-card"><span className="dashai-mark">D<span>AI</span></span><p className="eyebrow">Need study help?</p><h2>Ask DashAI</h2><p>Open the built-in Study Studio for explanations, retrieval questions and focused revision plans.</p><Link className="button primary" href="/tutor">Open Study Studio <ArrowRight size={17} /></Link></aside></div></main>;
}
