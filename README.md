# Goon

AI landing page builder. Type a sentence, get a landing page with QA scoring and one-click publishing.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Auth:** NextAuth.js v5 (Credentials provider, JWT sessions)
- **Database:** PostgreSQL via Prisma
- **Styling:** Tailwind CSS with custom design tokens
- **Typography:** Space Grotesk + JetBrains Mono

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env
# Edit .env with your database URL and secrets

# 3. Set up database
npx prisma db push

# 4. (Optional) Seed demo user
npx tsx prisma/seed.ts

# 5. Start development server
npm run dev
```

## Features

- **One-prompt generation** — describe your page in a sentence, get a full landing page
- **QA scoring** — automated checks for layout hallucinations and mobile responsiveness
- **Publish to web** — claim a `*.goon.so` subdomain and go live instantly
- **Section regeneration** — tweak individual sections without regenerating the whole page
- **Dark analytical UI** — Signal Lab aesthetic with ink black, indigo, cyan, teal palette

## Project Structure

```
app/
  (auth)/          — Sign in, sign up pages
  (app)/           — Dashboard, editor, generate (protected)
  api/             — REST API routes
  page.tsx         — Landing page
components/        — React components
lib/               — Business logic (AI, QA, DB, auth)
prisma/            — Database schema
```

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Yes | Random string for JWT signing |
| `NEXTAUTH_URL` | Yes | App URL (e.g., http://localhost:3000) |
| `AI_API_KEY` | No | OpenAI API key (uses mock generation when not set) |
| `NEXT_PUBLIC_APP_URL` | No | Public app URL |
