"use client";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return <main className="shell page-space"><section className="auth-card" role="alert"><p className="eyebrow">Something went wrong</p><h1>Let’s try that again.</h1><p>We couldn’t load this page. Your saved work is still in your account.</p><button className="button primary" onClick={reset}>Try again</button><a className="button secondary" href="/dashboard">Back to dashboard</a></section></main>;
}
