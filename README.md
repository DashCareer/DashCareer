# DashCareer

DashCareer is a branded A-Level revision platform built with Next.js, Supabase and Gumroad. It includes subject and exam-board pathways, notes, quizzes, flashcards, planning, progress, community tools, document storage and DashAI Study Studio.

## Local development

1. Copy `.env.example` to `.env.local` and fill in the Supabase project URL and publishable key.
2. Install dependencies with `pnpm install`.
3. Run `pnpm dev` and open `http://localhost:3000`.

## Production

Deploy the repository to Vercel and configure the variables listed in `.env.example`. Never commit private AI keys or the Gumroad notification URL. Email/password authentication works through Supabase. Google login additionally requires the Google provider to be enabled in Supabase Auth.

The two Gumroad product links are already wired into the pricing page. A protected Supabase Edge Function receives purchase notifications and updates membership access without licence keys. The founder must add that private notification URL to Gumroad once before automatic upgrades can operate.

## Important content note

DashCareer uses original revision material and official links. Curriculum mappings should be reviewed by a qualified teacher before being advertised as complete for a particular examination specification.
