import Link from "next/link";
import { safeRedirect } from "@/lib/safe-redirect";
import { linkedInSignInEnabled } from "@/lib/auth-providers";
import { ArrowLeft, LockKeyhole, Mail, UserRound } from "lucide-react";
import { signIn, signInWithLinkedIn, signUp } from "./actions";

export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string; message?: string }> }) {
  const params = await searchParams;
  const next = safeRedirect(params.next);
  const linkedInEnabled = await linkedInSignInEnabled();
  return <main className="shell page-space auth-page">
    <Link href="/" className="back-link"><ArrowLeft size={16}/> Back to DashCareer</Link>
    <section className="auth-card">
      <div className="page-intro centered"><p className="eyebrow"><LockKeyhole size={14}/> Your study account</p><h1>Sign in to DashCareer</h1><p>Save progress, plans, notes and Pro access across devices.</p></div>
      {params.error && <div className="notice error">{params.error}</div>}
      {params.message && <div className="notice success">{params.message}</div>}
      {linkedInEnabled ? <form action={signInWithLinkedIn}><input type="hidden" name="next" value={next}/><button className="button linkedin-button" type="submit">Continue with LinkedIn</button></form> : <p className="notice" role="status">LinkedIn sign-in is currently unavailable. Use your email and password below.</p>}
      <div className="auth-divider"><span>or use email</span></div>
      <div className="auth-columns">
        <form action={signIn} className="auth-form"><h2>Sign in</h2><input type="hidden" name="next" value={next}/><label><Mail size={16}/> Email<input name="email" type="email" autoComplete="email" required/></label><label><LockKeyhole size={16}/> Password<input name="password" type="password" autoComplete="current-password" minLength={8} required/></label><button className="button primary" type="submit">Sign in</button></form>
        <form action={signUp} className="auth-form"><h2>Create account</h2><input type="hidden" name="next" value={next}/><label><UserRound size={16}/> Name<input name="name" autoComplete="name" minLength={2} required/></label><label><Mail size={16}/> Email<input name="email" type="email" autoComplete="email" required/></label><label><LockKeyhole size={16}/> Password<input name="password" type="password" autoComplete="new-password" minLength={8} required/></label><button className="button secondary" type="submit">Create account</button></form>
      </div>
      <p className="auth-legal">By creating an account you agree to the <Link href="/legal/terms">Terms</Link> and <Link href="/legal/privacy">Privacy Policy</Link>.</p>
    </section>
  </main>;
}
