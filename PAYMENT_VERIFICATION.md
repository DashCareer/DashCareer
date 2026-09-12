# Payment verification — 12 September 2026

Deployed gumroad-webhook v3. Exact public product identifiers are required; missing purchase references and empty webhook secrets are rejected. Test notifications do not write paid entitlements.

13 isolated actual-handler scenarios passed: wrong/missing secret; both test flags; three unrelated product cases; missing purchase ID; monthly and annual activation; unlinked purchaser; refund revocation; membership database failure. Tests use a fake database, not live entitlements. This does not prove Gumroad-to-production checkout end to end.

Remaining launch gates:
- Confirm actual purchaser notifications carry the expected product identifiers and checkout token/email.
- Configure and verify refund, dispute, cancellation and subscription-ended notifications; sales Ping alone is insufficient.
- Make event processing transactional and resistant to out-of-order replay. Current upserts can apply an older active event after revocation.
- Define paid-through cancellation behavior and subscription renewal expiry instead of indefinite access.
- Move the deployed legacy webhook secret into managed function secrets before future environment-only deployment. Never commit its value.
- Authenticate as the founder to verify the final UI; founder role is separate from paid membership.
