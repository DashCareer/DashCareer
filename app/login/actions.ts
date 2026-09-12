"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { safeRedirect as safeNext } from "@/lib/safe-redirect";
import { linkedInSignInEnabled } from "@/lib/auth-providers";

export async function signIn(formData: FormData) {
  const supabase = await createClient();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = safeNext(formData.get("next"));
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    const message = error.code === "email_not_confirmed"
      ? "Confirm your email first. Check your inbox and spam folder for the DashCareer confirmation email."
      : error.status === 429
        ? "Too many attempts. Please wait a few minutes and try again."
        : "Email or password was not recognised. Check your details and try again.";
    redirect(`/login?error=${encodeURIComponent(message)}&next=${encodeURIComponent(next)}`);
  }
  redirect(next);
}

export async function signUp(formData: FormData) {
  const supabase = await createClient();
  const name = String(formData.get("name") ?? "").trim().slice(0, 80);
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = safeNext(formData.get("next"));
  if (name.length < 2 || password.length < 8) redirect(`/login?mode=signup&error=${encodeURIComponent("Use your name and a password of at least 8 characters")}&next=${encodeURIComponent(next)}`);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name }, emailRedirectTo: `${siteUrl}/auth/callback?next=${encodeURIComponent(next)}` } });
  if (error) redirect(`/login?mode=signup&error=${encodeURIComponent(error.message)}&next=${encodeURIComponent(next)}`);
  if (data.user && data.session) await supabase.from("profiles").upsert({ user_id: data.user.id, display_name: name });
  redirect(data.session ? next : `/login?message=${encodeURIComponent("Check your email to confirm your account")}&next=${encodeURIComponent(next)}`);
}

export async function signInWithLinkedIn(formData: FormData) {
  if (!await linkedInSignInEnabled()) redirect(`/login?error=${encodeURIComponent("LinkedIn sign-in is currently unavailable. Please use email and password.")}&next=${encodeURIComponent(safeNext(formData.get("next")))}`);
  const supabase = await createClient();
  const next = safeNext(formData.get("next"));
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const { data, error } = await supabase.auth.signInWithOAuth({ provider: "linkedin_oidc", options: { redirectTo: `${siteUrl}/auth/callback?next=${encodeURIComponent(next)}` } });
  if (error || !data.url) redirect(`/login?error=${encodeURIComponent("LinkedIn sign-in is not available yet")}`);
  redirect(data.url);
}
