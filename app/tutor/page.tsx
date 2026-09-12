import { TutorLauncher } from "@/components/tutor-launcher";
import type { Metadata } from "next";
import Link from "next/link";
import { LockKeyhole } from "lucide-react";
import { getCurrentUser } from "@/app/auth-session";
import { getMembership, membershipIsActive } from "@/db/queries";

export const metadata: Metadata = {
  title: "DashAI Study Studio",
  description: "Personalised A-Level explanations, retrieval checks and revision plans inside DashCareer.",
};
export const dynamic = "force-dynamic";

export default async function TutorPage() {
  const user = await getCurrentUser();
  const membership = user ? await getMembership(user.userId).catch(() => null) : null;
  const isPro = membershipIsActive(membership, user?.email, user?.isFounder);
  return (
    <main className="shell page-space">
      {isPro ? <TutorLauncher /> : (
        <section className="pro-gate">
          <span className="dashai-mark">D<span>AI</span></span>
          <p className="eyebrow">DashAI · Pro</p>
          <h1>Your personal study coach is ready to unlock.</h1>
          <p>DashAI explanations, retrieval checks and personalised plans are part of Pro. Free study notes, starter topics, progress tracking and the Pomodoro timer remain available.</p>
          <Link className="button primary" href="/pricing"><LockKeyhole size={17} /> View Pro options</Link>
        </section>
      )}
    </main>
  );
}
