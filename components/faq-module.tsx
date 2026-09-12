"use client";

import { useMemo, useState } from "react";
import { Search, Sparkles } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { faqItems } from "@/lib/faqs";

const categories = ["All", "Getting started", "Study tools", "Accounts & privacy", "Membership"] as const;

export function FaqModule({ compact = false }: { compact?: boolean }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof categories)[number]>("All");
  const matches = useMemo(() => {
    const needle = query.toLowerCase().trim();
    return faqItems.filter((item) => (category === "All" || item.category === category) && (!needle || `${item.question} ${item.answer} ${item.keywords.join(" ")}`.toLowerCase().includes(needle))).slice(0, compact ? 5 : undefined);
  }, [category, compact, query]);

  return (
    <section className={compact ? "faq-module compact" : "faq-module"} aria-labelledby="faq-heading">
      <div className="faq-heading"><div><p className="eyebrow"><Sparkles size={14} /> Quick answers</p><h2 id="faq-heading">Frequently asked questions</h2></div>{!compact && <p>Search DashCareer help before opening the study assistant.</p>}</div>
      {!compact && <><label className="faq-search"><Search size={19} /><span className="sr-only">Search frequently asked questions</span><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search accounts, uploads, payments…" /></label><div className="faq-filters" aria-label="FAQ categories">{categories.map((item) => <button type="button" key={item} className={category === item ? "active" : ""} onClick={() => setCategory(item)}>{item}</button>)}</div></>}
      <Accordion type="multiple" className="faq-list">{matches.map((item) => <AccordionItem value={item.id} key={item.id}><AccordionTrigger>{item.question}<span>{item.category}</span></AccordionTrigger><AccordionContent><p>{item.answer}</p></AccordionContent></AccordionItem>)}</Accordion>
      {!matches.length && <div className="faq-empty"><strong>No exact answer found.</strong><p>Try a shorter search or ask DashAI from the Study Studio.</p></div>}
    </section>
  );
}
