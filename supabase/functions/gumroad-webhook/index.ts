import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const WEBHOOK_SECRET = Deno.env.get("GUMROAD_WEBHOOK_SECRET") ?? "";
const headers = { "content-type": "application/json" };

function field(form: FormData, ...names: string[]) {
  for (const name of names) {
    const value = String(form.get(name) ?? "").trim();
    if (value) return value;
  }
  return "";
}
function planFor(form: FormData): "monthly" | "annual" | null {
  const ids = [field(form, "product_permalink"), field(form, "short_product_id")];
  try {
    const url = new URL(field(form, "product_url"));
    if (url.hostname === "cagdasozturk.gumroad.com") ids.push(url.pathname.replace(/^\/l\//, ""));
  } catch { /* Product URLs are optional. */ }
  if (ids.includes("atypnn")) return "annual";
  if (ids.includes("irrlrl")) return "monthly";
  return null;
}
function readToken(form: FormData) {
  const direct = field(form, "dc_checkout", "url_params[dc_checkout]", "custom_fields[dc_checkout]");
  if (direct) return direct;
  const raw = field(form, "url_params");
  if (!raw) return "";
  try {
    const parsed = JSON.parse(raw);
    return typeof parsed.dc_checkout === "string" ? parsed.dc_checkout : "";
  } catch {
    try { return new URLSearchParams(raw).get("dc_checkout") ?? ""; } catch { return ""; }
  }
}
async function digest(value: string) {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(bytes)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers });
  const url = new URL(req.url);
  if (!WEBHOOK_SECRET || url.searchParams.get("secret") !== WEBHOOK_SECRET) return new Response(JSON.stringify({ error: "Unauthorised" }), { status: 401, headers });
  let form: FormData;
  try { form = await req.formData(); } catch { return new Response(JSON.stringify({ error: "Invalid notification" }), { status: 400, headers }); }

  // Gumroad's test ping replays sale data; it must never grant paid access.
  if (["true", "1", "yes"].includes(field(form, "test", "is_test").toLowerCase())) {
    return new Response(JSON.stringify({ accepted: true, test: true, linked: false }), { headers });
  }

  const email = field(form, "email", "purchaser_email", "buyer_email").toLowerCase();
  const plan = planFor(form);
  if (!email || !plan) return new Response(JSON.stringify({ accepted: true, linked: false, reason: "unrecognised-purchase" }), { headers });

  const eventName = (url.searchParams.get("event") || field(form, "resource_name", "event", "type") || "sale").toLowerCase();
  if (!["sale", "refund", "cancellation", "subscription_ended", "dispute", "dispute_won", "subscription_updated", "subscription_restarted"].includes(eventName)) return new Response(JSON.stringify({ accepted: true, linked: false, reason: "unsupported-event" }), { headers });
  const truthy = (name: string) => ["true", "1", "yes"].includes(field(form, name).toLowerCase());
  const paidThrough = field(form, "subscription_ended_at", "ended_at") || null;
  const paidThroughTime = paidThrough ? Date.parse(paidThrough) : Number.NaN;
  // A cancellation stops renewal, but access remains active until Gumroad's
  // supplied membership end date. Refunds, disputes, and ended memberships
  // revoke access immediately.
  const cancellationHasEnded = eventName === "cancellation"
    && (!Number.isFinite(paidThroughTime) || paidThroughTime <= Date.now());
  const inactive = ["refund", "subscription_ended", "dispute"].includes(eventName)
    || cancellationHasEnded
    || truthy("refunded") || truthy("disputed") || truthy("chargebacked")
    || (eventName !== "cancellation" && Boolean(field(form, "subscription_ended_at")));
  const status = inactive ? "inactive" : "active";
  const purchaseId = field(form, "sale_id", "id", "purchase_id", "subscription_id") || null;
  if (!purchaseId) return new Response(JSON.stringify({ error: "Missing purchase reference" }), { status: 400, headers });
  const token = readToken(form);
  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  let account: { user_id: string; email?: string } | null = null;
  if (token) {
    const { data, error } = await supabase.from("checkout_sessions").select("user_id,email").eq("token", token).maybeSingle();
    if (error) return new Response(JSON.stringify({ error: "Account lookup temporarily unavailable" }), { status: 500, headers });
    if (data && String(data.email).toLowerCase() === email) account = data;
  }
  if (!account) {
    const { data, error } = await supabase.from("checkout_accounts").select("user_id,email").eq("email", email).maybeSingle();
    if (error) return new Response(JSON.stringify({ error: "Account lookup temporarily unavailable" }), { status: 500, headers });
    account = data;
  }

  const eventKey = await digest(`${purchaseId ?? "sale"}:${eventName}:${email}:${plan}`);
  const eventWrite = await supabase.from("payment_events").upsert({
    event_key: eventKey, user_id: account?.user_id ?? null, buyer_email: email, plan,
    event_name: eventName, purchase_id: purchaseId, status, received_at: new Date().toISOString()
  }, { onConflict: "event_key" });
  if (eventWrite.error) return new Response(JSON.stringify({ error: "Could not record payment" }), { status: 500, headers });
  if (!account) return new Response(JSON.stringify({ accepted: true, linked: false, reason: "account-not-found" }), { headers });

  const membershipWrite = await supabase.from("memberships").upsert({
    user_id: account.user_id, plan, status,
    product_permalink: plan === "annual" ? "atypnn" : "irrlrl",
    purchase_id: purchaseId, license_key_hash: eventKey,
    expires_at: eventName === "cancellation" && paidThrough
      ? new Date(paidThroughTime).toISOString()
      : inactive ? new Date().toISOString() : null,
    updated_at: new Date().toISOString()
  }, { onConflict: "user_id" });
  if (membershipWrite.error) return new Response(JSON.stringify({ error: "Could not update membership" }), { status: 500, headers });
  if (token) await supabase.from("checkout_sessions").update({ status: "completed", completed_at: new Date().toISOString() }).eq("token", token);

  return new Response(JSON.stringify({ accepted: true, linked: true, status }), { headers });
});
