export type GumroadPlan = "monthly" | "annual";

function field(form: FormData, ...names: string[]) {
  for (const name of names) {
    const value = String(form.get(name) ?? "").trim();
    if (value) return value;
  }
  return "";
}

function truthy(value: FormDataEntryValue | null) {
  return ["true", "1", "yes"].includes(String(value ?? "").toLowerCase());
}

export function readBuyerEmail(form: FormData) {
  return field(form, "email", "purchaser_email", "buyer_email").toLowerCase();
}

export function readPurchaseId(form: FormData) {
  return field(form, "sale_id", "id", "purchase_id", "subscription_id") || null;
}

export function identifyPlan(form: FormData): GumroadPlan | null {
  const product = [
    field(form, "product_permalink"),
    field(form, "product_id"),
    field(form, "short_product_id"),
    field(form, "product_name"),
    field(form, "product_url"),
  ].join(" ").toLowerCase();
  if (/\batypnn\b|dashcareer\s+membership\s+annual|\bannual\b/.test(product)) return "annual";
  if (/\birrlrl\b|dashcareer\s+membership\s+monthly|\bmonthly\b/.test(product)) return "monthly";
  return null;
}

export function readCheckoutToken(form: FormData) {
  const direct = field(form, "dc_checkout", "url_params[dc_checkout]", "custom_fields[dc_checkout]");
  if (direct) return direct;
  const encoded = field(form, "url_params");
  if (!encoded) return "";
  try {
    const parsed = JSON.parse(encoded) as Record<string, unknown>;
    return typeof parsed.dc_checkout === "string" ? parsed.dc_checkout : "";
  } catch {
    try { return new URLSearchParams(encoded).get("dc_checkout") ?? ""; } catch { return ""; }
  }
}

export function readEventName(requestUrl: string, form: FormData) {
  return (new URL(requestUrl).searchParams.get("event") || field(form, "resource_name", "event", "type") || "sale").toLowerCase();
}

export function purchaseIsInactive(eventName: string, form: FormData) {
  const expiry = readExpiry(form);
  const cancellationHasEnded = eventName === "cancellation"
    && (!expiry || !Number.isFinite(Date.parse(expiry)) || Date.parse(expiry) <= Date.now());
  return ["refund", "subscription_ended", "dispute"].includes(eventName)
    || cancellationHasEnded
    || truthy(form.get("refunded"))
    || truthy(form.get("disputed"))
    || truthy(form.get("chargebacked"))
    || (eventName !== "cancellation" && Boolean(field(form, "subscription_ended_at")));
}

export function readExpiry(form: FormData) {
  return field(form, "subscription_ended_at", "ended_at") || null;
}
