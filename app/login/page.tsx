import Link from "next/link";
import { safeRedirect } from "@/lib/safe-redirect";
import { linkedInSignInEnabled } from "@/lib/auth-providers";
import { ArrowLeft, LockKeyhole, Mail, UserRound } from "lucide-react";
import { AuthSubmit, PasswordField } from "@/components/auth-controls";
import { signIn, signInWithLinkedIn, signUp } from "./actions";

export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string; message?: string; mode?: string }> }) {
  const params = await searchParams;
  const next = safeRedirect(params.next);
  const creating = params.mode === "signup";
  const linkedInEnabled = await linkedInSignInEnabled();
  const destination = encodeURIComponent(next);
  return <main className="shell page-space auth-page auth-page-simple">
    <Link href="/" className="back-link"><ArrowLeft size={16}/> Back to DashCareer</Link>
    <section className="auth-card">
      <div className="page-intro centered"><p className="eyebrow"><LockKeyhole size={14}/> Your study account</p><h1>{creating ? "Start your study journey" : "Welcome back"}</h1><p>{creating ? "Create a free account to save your notes, plans and progress." : "Sign in to pick up where you left off."}</p></div>
      <nav className="auth-switch" aria-label="Account options">
        <Link href={`/login?next=${destination}`} aria-current={!creating ? "page" : undefined}>Sign in</Link>
        <Link href={`/login?mode=signup&next=${destination}`} aria-current={creating ? "page" : undefined}>Create account</Link>
      </nav>
      {params.error && <div className="notice error" role="alert">{params.error}</div>}
      {params.message && <div className="notice success" role="status">{params.message}</div>}
      {linkedInEnabled && <><form action={signInWithLinkedIn} className="auth-social"><input type="hidden" name="next" value={next}/><AuthSubmit className="button linkedin-button" pendingLabel="Connecting…">Continue with LinkedIn</AuthSubmit></form><div className="auth-divider"><span>or use email</span></div></>}
      <div className="auth-single">
        <form action={creating ? signUp : signIn} className="auth-form" key={creating ? "signup" : "signin"}>
          <input type="hidden" name="next" value={next}/>
          {creating && <label><UserRound size={16}/> Name<input name="name" autoComplete="name" minLength={2} maxLength={80} required/></label>}
          <label><Mail size={16}/> Email<input name="email" type="email" autoComplete="email" autoCapitalize="none" spellCheck={false} required/></label>
          <PasswordField creating={creating}/>
          <AuthSubmit pendingLabel={creating ? "Creating your account…" : "Signing in…"}>{creating ? "Create free account" : "Sign in"}</AuthSubmit>
        </form>
      </div>
      <p className="auth-help">{creating ? "After signing up, check your inbox and spam folder for your confirmation email." : "Use the email and password you chose when creating your DashCareer account."}</p>
      {creating && <p className="auth-legal">By creating an account you agree to the <Link href="/legal/terms">Terms</Link> and <Link href="/legal/privacy">Privacy Policy</Link>.</p>}
    </section>
  </main>;
}
