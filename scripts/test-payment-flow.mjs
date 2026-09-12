import assert from "node:assert/strict";
import { identifyPlan, purchaseIsInactive, readBuyerEmail, readCheckoutToken, readEventName, readExpiry, readPurchaseId } from "../lib/gumroad-webhook.ts";

const monthly = new FormData();
monthly.set("purchaser_email", " Student@Example.com ");
monthly.set("product_permalink", "irrlrl");
monthly.set("sale_id", "sale_monthly_1");
monthly.set("url_params[dc_checkout]", "checkout-123");
assert.equal(identifyPlan(monthly), "monthly");
assert.equal(readBuyerEmail(monthly), "student@example.com");
assert.equal(readPurchaseId(monthly), "sale_monthly_1");
assert.equal(readCheckoutToken(monthly), "checkout-123");
assert.equal(readEventName("https://dashcareer.example/api/gumroad/ping", monthly), "sale");
assert.equal(purchaseIsInactive("sale", monthly), false);

const annual = new FormData();
annual.set("email", "student@example.com");
annual.set("product_url", "https://cagdasozturk.gumroad.com/l/atypnn");
annual.set("product_name", "DashCareer Membership Annual");
annual.set("url_params", JSON.stringify({ dc_checkout: "checkout-annual" }));
assert.equal(identifyPlan(annual), "annual");
assert.equal(readCheckoutToken(annual), "checkout-annual");

const refund = new FormData();
refund.set("email", "student@example.com");
refund.set("product_name", "DashCareer Membership Monthly");
refund.set("refunded", "true");
refund.set("subscription_ended_at", "2026-09-30T12:00:00Z");
assert.equal(purchaseIsInactive("refund", refund), true);
assert.equal(readExpiry(refund), "2026-09-30T12:00:00Z");

const cancelled = new FormData();
cancelled.set("subscription_ended_at", "2099-09-30T12:00:00Z");
cancelled.set("cancelled_at", "2026-09-12T12:00:00Z");
assert.equal(purchaseIsInactive("cancellation", cancelled), false);
assert.equal(readExpiry(cancelled), "2099-09-30T12:00:00Z");

const endedCancellation = new FormData();
endedCancellation.set("subscription_ended_at", "2000-01-01T00:00:00Z");
assert.equal(purchaseIsInactive("cancellation", endedCancellation), true);

const cancellationWithoutEnd = new FormData();
assert.equal(purchaseIsInactive("cancellation", cancellationWithoutEnd), true);

const unknown = new FormData();
unknown.set("product_name", "Another product");
assert.equal(identifyPlan(unknown), null);

console.log("Payment-flow parser: 21 assertions passed");
