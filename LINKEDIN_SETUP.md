# LinkedIn login setup

The site now uses Supabase provider `linkedin_oidc`; Google has been removed from the login flow. A personal LinkedIn profile URL is not an OAuth app and cannot enable login by itself.

In a LinkedIn developer app associated with the appropriate LinkedIn Page, request the product **Sign In with LinkedIn using OpenID Connect**. Use only the identity scopes `openid profile email`.

Authorized provider redirect URL:
`https://nqhirqfwjckydtnlryga.supabase.co/auth/v1/callback`

Save that app's Client ID and Client Secret directly in Supabase → Authentication → Providers → LinkedIn (OIDC), then enable it. Do not commit credentials or send them through chat.

Supabase site URL: `https://dashcareer.vercel.app`
Supabase allowed application callback: `https://dashcareer.vercel.app/auth/callback` (allow the application's `next` query parameter as appropriate).

Verify: sign in, cancel sign-in, sign out, sign in again, and confirm the existing account identity and founder access. Account linking must use verified identities, never a client-editable profile field.

Official instructions: https://supabase.com/docs/guides/auth/social-login/auth-linkedin
