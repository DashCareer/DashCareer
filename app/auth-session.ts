import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type DashCareerUser = { userId: string; email: string; displayName: string };

export async function getCurrentUser(): Promise<DashCareerUser | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims?.sub) return null;
  const email = String(data.claims.email ?? "");
  const metadata = (data.claims.user_metadata ?? {}) as Record<string, unknown>;
  const displayName = String(metadata.full_name ?? metadata.name ?? email.split("@")[0] ?? "Student");
  return { userId: data.claims.sub, email, displayName };
}

export async function requireUser(returnTo: string): Promise<DashCareerUser> {
  const user = await getCurrentUser();
  if (user) return user;
  redirect(signInPath(returnTo));
}

export function signInPath(returnTo: string): string {
  return `/login?next=${encodeURIComponent(returnTo)}`;
}

export function signOutPath(returnTo = "/"): string {
  return `/auth/signout?next=${encodeURIComponent(returnTo)}`;
}
