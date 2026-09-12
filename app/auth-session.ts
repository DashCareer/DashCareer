import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type DashCareerUser = { userId: string; email: string; displayName: string; isFounder: boolean };

export async function getCurrentUser(): Promise<DashCareerUser | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  const email = data.user.email ?? "";
  const metadata = data.user.user_metadata;
  const displayName = String(metadata.full_name ?? metadata.name ?? email.split("@")[0] ?? "Student");
  const isFounder = data.user.app_metadata?.dashcareer_role === "founder";
  return { userId: data.user.id, email, displayName, isFounder };
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
