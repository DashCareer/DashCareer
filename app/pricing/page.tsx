import Link from "next/link";
import type { Metadata } from "next";
import { Check, Clock3, RefreshCw, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { startGumroadCheckoutAction } from "@/app/actions";
import { signInPath, getCurrentUser } from "@/app/auth-session";
import { getMembership, membershipIsActive } from "@/db/queries";

const free = ["All 26 subject hubs", "First 3 curriculum areas per subject", "Topic summaries and revision checklists", "Practice quizzes and flashcards", "Progress dashboard and persistent Pomodoro"];
const pro = ["Access to all current curriculum outlines and draft cards", "Six exam-board views and official specification links", "Step-by-step walkthroughs and worked approaches", "Model-answer structures and exam technique", "Formula sheets, common mistakes and memory boosters", "Private document uploads", "DashAI Study Studio"];

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Pricing", description: "Compare DashCareer Free and Pro A-Level revision features." };

function CheckoutButton({ plan, featured }: { plan: "monthly" | "annual"; featured?: boolean }) {
  return <form action={startGumroadCheckoutAction} className="checkout-form"><input type="hidden" name="plan" value={plan} /><button className={`button ${featured ? "primary" : "secondary"}`} type="submit">Choose {plan} <Zap size={17} /></button></form>;
}

export default async function PricingPage() {
  const user = await getCurrentUser();
  const owner = Boolean(user && process.env.DASHCAREER_ADMIN_EMAIL && user.email.toLowerCase() === process.env.DASHCAREER_ADMIN_EMAIL.toLowerCase());
  const membership = user ? await getMembership(user.userId).catch(() => null) : null;
  const active = membershipIsActive(membership, user?.email, user?.isFounder);
  const activeLabel = user?.isFounder || owner ? "Founder access · no purchase required" : `${membership?.plan === "annual" ? "Annual" : "Monthly"} membership`;
  const signIn = signInPath("/pricing");
  const purchaseControl = (plan: "monthly" | "annual", featured = false) => active
    ? <Link className={`button ${featured ? "primary" : "secondary"}`} href="/dashboard"><Check size={17} /> Pro is active</Link>
    : user ? <CheckoutButton plan={plan} featured={featured} />
    : <a className={`button ${featured ? "primary" : "secondary"}`} href={signIn} target="_top">Sign in to choose {plan}</a>;

  return (
    <main className="shell page-space pricing-page">
      <div className="page-intro centered"><p className="eyebrow"><Sparkles size={14} /> Clear access levels</p><h1>Revise free. Go further with Pro.</h1><p>The essential study loop stays free. Pro adds advanced tools and access to the current library. Detailed lessons and specification reviews are still in progress.</p></div>
      {active && <div className="notice success"><Check size={18} /> Pro is active on this account. Every advanced study tool is unlocked.</div>}
      <div className="pricing-grid access-pricing">
        <article className="price-card"><div className="access-label">Free</div><p>Core revision</p><h2>£0</h2><span>A useful study workspace without a card.</span><ul>{free.map((item) => <li key={item}><Check size={17} /> {item}</li>)}</ul><Link className="button secondary" href="/subjects">Start free</Link></article>
        <article className="price-card featured"><div className="price-badge">Most flexible</div><div className="access-label">Pro monthly</div><p>Complete access</p><h2>£5.99 <small>/ month</small></h2><span>Full tools with monthly flexibility.</span><ul>{pro.map((item) => <li key={item}><Check size={17} /> {item}</li>)}</ul>{purchaseControl("monthly", true)}</article>
        <article className="price-card"><div className="access-label">Pro annual</div><p>Best value</p><h2>£49 <small>/ year</small></h2><span>About £4.08 per month when paid annually.</span><ul>{pro.map((item) => <li key={item}><Check size={17} /> {item}</li>)}</ul>{purchaseControl("annual")}</article>
      </div>
      <section className="membership-activate automatic-access">
        <div><p className="eyebrow"><Zap size={15} /> Automatic access</p><h2>{active ? "Your Pro access is active" : "Checkout is linked to your account."}</h2><p>Start checkout while signed in. Your account reference and email are sent with the purchase so Pro can unlock automatically once payment confirmation is connected—no licence key or activation form.</p><div className="activation-safety"><ShieldCheck size={17} /><span>Payment details stay with Gumroad. DashCareer stores only the purchase reference and access status.</span></div></div>
        {active ? <div className="membership-badge"><Check size={22} /><span><b>Pro active</b><small>{activeLabel}</small></span></div> : <div className="automatic-steps"><span><b>1</b> Sign in</span><span><b>2</b> Pay on Gumroad</span><span><b>3</b> Pro activates</span><Link href="/pricing"><RefreshCw size={14} /> Refresh access status</Link><small><Clock3 size={14} /> Updates when Gumroad confirms payment.</small></div>}
      </section>
      {owner && <div className="pricing-note owner-payment-link"><strong>Founder payment status:</strong> check whether Gumroad notifications are arriving. <Link href="/setup/payments">Open payment connection</Link></div>}
      <div className="pricing-note"><strong>Important:</strong> begin checkout while signed in and keep the prefilled email. Receipts and payment details are handled by Gumroad. Automatic activation becomes live after the founder connects Gumroad&apos;s purchase notifications.</div>
    </main>
  );
}
