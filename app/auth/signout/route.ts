import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const requested = url.searchParams.get("next");
  const next = requested?.startsWith("/") && !requested.startsWith("//") ? requested : "/";
  const supabase = await createClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL(next, url.origin));
}
