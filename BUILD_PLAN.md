# Goon — Build Plan

## 1. PRODUCT

Goon is an AI landing page builder that takes a single text prompt from a non-technical entrepreneur and produces a complete, styled, mobile-responsive landing page in under 30 seconds. The core value collapses what is normally a $2k–$10k freelancer job (copy + design + responsive QA + hosting) into a typed sentence. The primary user is a solo operator who has a business idea, a domain in mind, and zero tolerance for a CMS — they want to test demand *this afternoon*. The specific pain solved is the gap between "I have a prompt" and "I have a live URL my friends can open on their phone" — currently broken by hallucinated sections, broken mobile layouts, and deployment friction. Two product capabilities close that gap: an automated QA scoring pass that flags hallucinated layout choices and mobile responsiveness regressions *before* the user sees the page, and a one-click publish flow that claims a `*.goon.so` subdomain and serves the page on the public internet without DNS work.

## 2. WHO IT'S FOR

**ICP:** solo founder / indie hacker / "idea-stage" operator. Age 22–40, technically curious but not a frontend dev. Has launched 0–3 things before. Uses Twitter/X, Product Hunt, Discord. Vocabulary: "ship," "MVP," "validate," "no-code." Time horizon: wants a live page in one sitting, not next week. Has $0–$50/month for tools.

**How this shapes the product:**
- **One primary CTA per screen.** No nested navigation on the generate flow. The prompt box is the page; the result is the next page.
- **No jargon.** Words like "component," "responsive breakpoint," "viewport," "DOM" are absent. Words like "publish," "share," "looks good on phone," "score" are present.
- **Generous defaults, zero config.** No theme pickers on first run. No "choose your font." The system picks; user can tweak after.
- **Mobile preview is the default preview.** Built for the device they will share from.
- **Tone of microcopy:** confident, slightly dry, never cute. ("Looks good on iPhone. 91/100." not "🎉 Your page is ready!")
- **Onboarding = one prompt.** No "tell us about yourself" modal.

## 3. LOOK & FEEL

**Overall vibe/positioning:** dark analytical interface — feels like a terminal that happens to be a design tool. "Lab instrument," not "creative canvas." The aesthetic signals: *this is a system that measures things*. Every generated page comes with a score, so the parent app should feel like the thing that produces scores. Restrained, dense information, monospace where precision matters, geometric sans where personality matters.

**Color palette (CSS custom properties):**
- `--ink: #0A0B0F` — page background, near-black with a hint of blue
- `--ink-2: #11131A` — surface 1 (cards, inputs)
- `--ink-3: #1A1D27` — surface 2 (raised, hover)
- `--border: #232734` — hairlines, dividers
- `--text: #E6E8EE` — primary text
- `--text-dim: #8A90A0` — secondary text, labels
- `--text-faint: #54586A` — tertiary, placeholders
- `--indigo: #5B5BFF` — primary action, focus rings, links
- `--cyan: #4DD0E1` — scores, data viz accents
- `--teal: #2EE6B0` — success states, "published" indicator, "passing" QA
- `--amber: #F5B547` — warnings, soft QA flags
- `--red: #FF5A6B` — errors, hard QA flags, destructive

**Typography:**
- Headings, UI chrome, body: **Space Grotesk** 400/500/600. Tighter tracking (-0.01em) on display sizes.
- Numerics, scores, code, IDs, timestamps, generated HTML previews: **JetBrains Mono** 400/500.
- Scale: 12 / 13 / 14 (base) / 16 / 20 / 24 / 32 / 48. Line-height 1.5 body, 1.2 display.
- Tabular numerals (`font-variant-numeric: tabular-nums`) on all scores and counts.

**Spacing/layout style:**
- 4px base unit. Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64.
- 12px corner radius on cards, 6px on inputs/buttons, 0px on tables.
- 1px hairline borders in `--border` — no shadows on surfaces; depth comes from background tier shifts (`--ink` → `--ink-2` → `--ink-3`).
- Layout: 1280px max content width, 240px persistent left rail on dashboard routes, full-bleed on the editor and generated previews.
- Grid: 8px baseline; components snap to multiples of 8.

**Key components:**
- `PromptInput` — auto-growing textarea (min 1 row, max 8), JetBrains Mono, character count bottom-right, "Generate" button anchored bottom-right of the field.
- `ScoreBadge` — circular ring (SVG stroke-dasharray) with numeric score in JetBrains Mono; ring color = teal ≥80, amber 60–79, red <60.
- `QAReportPanel` — collapsible right rail; rows of checks, each with: name, status icon, numeric value, one-line explanation, "show in preview" link.
- `PreviewFrame` — iframe sandboxing the generated HTML; device toggle (Mobile 375 / Mobile 414 / Tablet 768 / Desktop 1280) as a segmented control above.
- `PublishDialog` — modal with subdomain input, availability check, claim button, success state showing the live URL.
- `PageCard` — used in dashboard list: thumbnail (rendered HTML at 320×200), title, status pill, score, last edited, "Open" / "Publish" actions.
- `TopBar` — 56px tall, logo left, search center, user menu right.

**Iconography:** Lucide React. 16px in dense lists, 20px in primary actions. Stroke 1.5. Never filled. No emoji as UI icons.

**Imagery:** the app itself contains almost no photographic imagery. The generated pages contain whatever the AI produces. Empty states use thin line illustrations in `--text-faint` (custom SVG, not a stock library).

**Interaction/motion:**
- 120ms ease-out on hover/focus color shifts.
- 200ms ease-in-out on the preview frame when switching device widths (the iframe keeps content size, the wrapper resizes).
- Score ring animates from 0 → final value over 600ms ease-out when a QA pass completes.
- Page transitions: no slide; just opacity 0→1 over 150ms. Keep it instant-feeling.
- No skeleton loaders that shimmer for >2s. Use a deterministic "Analyzing layout…" → "Checking mobile…" → "Scoring copy…" staged progress (3 steps, ~1.5s each) so the user knows work is happening.

### Screen-by-screen

**Screen A — Landing (`/`)**
- 100vh, centered 720px column on `--ink`.
- Top: small `goon` wordmark (Space Grotesk 500, 16px, `--text-dim`).
- Headline: 48px Space Grotesk 600, tracking -0.02em, line-height 1.1. "Type a sentence. Get a landing page." In `--text`.
- Subhead: 16px Space Grotesk 400, `--text-dim`, max-width 520px. "Goon writes the copy, picks the layout, and checks it on a phone. You ship."
- PromptInput, full-width, 56px tall, prompt-style: `placeholder="A newsletter for indie founders about pricing. Signup CTA. Indigo + white."`. On submit, button shows spinner and label becomes "Generating…".
- Below input, three single-line hints in `--text-faint`, 13px: "Average generation: 18s" / "Tested on 4 viewports" / "Free to try, no card required".
- Footer: "Built by [team]" in `--text-faint`, 12px.

**Screen B — Sign in / Sign up (`/signin`, `/signup`)**
- Two-column on ≥1024px: left is a 480px form panel on `--ink-2`, right is a static preview of a generated page (a hard-coded example, not a real one — labeled "example" in faint text).
- Form: email field, password field, primary button, link to the other flow. No "forgot password" on first version — instead, error state says "If this email exists, we sent a reset link" (no enumeration).
- Mobile: form only, preview hidden.
- After signup, redirect to `/onboard` (the prompt page), not `/dashboard`.

**Screen C — Onboard / Generate (`/onboard` and `/generate`)**
- Left rail (240px): logo, "Projects" (collapsible, empty state: "No projects yet"), "Account" link at bottom.
- Main: empty state on first visit = a single centered PromptInput at 720px wide, plus three "Try one" example chips below it (`"Waitlist for a coffee subscription"`, `"Notion template for hiring"`, `"Personal site for a watercolorist"`).
- On submit: input area collapses to a compact 80px "generation status" card with the staged progress text, and a `PreviewFrame` appears to the right at 60% width showing a live-updating iframe as the page is generated (server streams partial HTML).
- When generation completes, the `QAReportPanel` slides in from the right (280px) showing score, list of checks, pass/warn/fail icons. The preview frame is still primary.

**Screen D — Editor (`/p/[id]`)**
- Top bar: back arrow, editable title (inline, JetBrains Mono), score badge, device toggle, "Publish" button (indigo), "Save" auto-state.
- Three columns on ≥1280px:
  - Left (200px): section list. Each generated section is a row with a drag handle, the section's intent ("hero", "features", "pricing", "testimonials", "cta", "footer"), and a "regenerate" icon. Click scrolls the preview to that section.
  - Center (flex): `PreviewFrame` with device toggle. This is the canvas.
  - Right (300px): `QAReportPanel` collapsed by default, expands on click. Below it: "Prompt" — the original prompt, read-only, with an "Edit prompt" link that reopens generate.
- The user does not edit HTML. To change a section, they click "regenerate" and a small inline form appears ("What should change?") with a one-line input and a Regenerate button. The section re-renders in place; the score recalculates.

**Screen E — Publish Dialog (modal over editor)**
- 480px wide, `--ink-2` background.
- Title: "Publish to the web" (Space Grotesk 600, 20px).
- Body:
  - Subdomain input: `[your-slug]` (text field, JetBrains Mono) `.goon.so` (suffix, dim). Live availability check below: "Available" in teal with check icon, "Taken" in red with x, "Checking…" in faint.
  - Auto-suggested slug (from page title, slugified).
  - Checkbox (default on): "Make this page indexable by Google."
  - Primary button: "Claim & publish" (indigo, full width).
- On success: the dialog morphs in place to a "Published" state — the live URL is shown in a copy-to-clipboard field, with a "Open ↗" link, and a small teal "Live" pill in the top corner. Below: "Any changes you make will redeploy automatically."

**Screen F — Dashboard (`/dashboard`)**
- Left rail same as editor.
- Top bar with search input and a "+ New page" button (indigo).
- Main: 3-column grid of `PageCard`s (responsive: 1 col <768, 2 col <1280, 3 col ≥1280).
- Filter row above grid: All / Drafts / Published, and a sort dropdown (Last edited / Score / Title).
- Empty state: centered illustration + "Your first page is one sentence away." + button to `/generate`.

**Screen G — Public published page (`/p/[id]/live` or `https://[slug].goon.so`)**
- Served by a route handler. Returns the generated HTML with no parent app chrome. The page is fully self-contained (inline CSS, no external font requests, no JS required).
- A small footer badge in the bottom-right: "Made with Goon" linking to `/`. The badge is the only product attribution; it's a real link, not invented social proof.

## 4. USER FLOWS

**Flow 1 — Sign up and generate first page**
1. User lands on `/`. Sees prompt input. Types a sentence.
2. Clicking "Generate" without auth → modal: "Create an account to save your work" → redirects to `/signup?returnTo=/generate&prompt=...`.
3. User signs up with email + password (≥8 chars). No email verification in v1 (note in code: hook for it later).
4. Auto sign-in via NextAuth credentials. Redirect to `/generate` with the prompt prefilled.
5. Generation begins. Preview streams. ~15–30s total.
6. QA score appears, ≥1 issue is likely. User reads the report.
7. User clicks "Publish" → subdomain dialog → claims slug → live URL shown.
8. User clicks the live URL in a new tab. Sees the page on their phone. Shares the URL.

States covered: empty input (button disabled), invalid email (inline error), password too short, taken slug (regenerate suggestion), generation error (toast + retry), publish network error (retry button, keeps modal open), user already has 5 pages (soft cap, modal says "Free tier: 5 pages. Upgrade coming soon.").

**Flow 2 — Return and edit**
1. User returns to `/dashboard`. Sees page card with score and "Draft" pill.
2. Clicks card → editor opens. Sees score, preview, sections.
3. Clicks "regenerate" on the hero section, types "make the headline punchier." Section updates. Score recalculates.
4. Clicks "Publish" again (already has a slug). Modal says "Redeploy to [slug].goon.so?" with one button.
5. Live page updates within 5s.

**Flow 3 — Sign in (returning user)**
1. `/signin`. Email + password. On error: "Email or password is incorrect" (no enumeration).
2. On success: redirect to `/dashboard` (or `returnTo` if present).

**Flow 4 — QA flag response**
1. User sees a red flag in the QA panel: "Hero CTA is offscreen on 375px viewport."
2. Clicks the flag. Preview scrolls to the hero and overlays a translucent red mask on the offending element with a label "CTA not visible at 375px."
3. User clicks "regenerate" on that section. New version generated. Flag re-checked. If pass, badge turns teal.

## 5. PAGES/ROUTES

| Route | Purpose | Layout | Main UI |
|---|---|---|---|
| `/` | Marketing landing | Centered 720px column, no nav | Wordmark, headline, PromptInput, hints |
| `/signup` | Account creation | Two-col (form + preview) on ≥1024 | Email, password, submit |
| `/signin` | Account login | Same as signup | Email, password, submit |
| `/generate` | Create a new page | Left rail + main with prompt area | PromptInput, example chips, PreviewFrame (post-submit) |
| `/onboard` | First-run alias of `/generate` | Same as `/generate` | Same |
| `/dashboard` | List of user's pages | Left rail + grid of PageCards | Search, filter, sort, "+ New page" |
| `/p/[id]` | Editor for a specific page | Three-column: sections, preview, QA | Top bar with score + device toggle + publish, section list, PreviewFrame, QAReportPanel |
| `/p/[id]/live` | Server-rendered published HTML | None — raw HTML response | The generated page, plus footer badge |
| `/api/auth/[...nextauth]` | NextAuth handler | n/a | Credentials provider |
| `/api/pages` | CRUD for pages | n/a | POST create, GET list |
| `/api/pages/[id]` | Single page ops | n/a | GET, PATCH (title, prompt), DELETE |
| `/api/pages/[id]/generate` | Trigger AI generation, stream partial HTML | n/a | POST; returns SSE |
| `/api/pages/[id]/sections/[sectionId]/regenerate` | Regenerate a section | n/a | POST with `{instruction}` |
| `/api/pages/[id]/qa` | Run QA scorer, return report | n/a | GET (cached), POST (re-run) |
| `/api/pages/[id]/publish` | Claim subdomain, mark live | n/a | POST `{slug}`; idempotent |
| `/api/subdomains/check` | Slug availability | n/a | GET `?slug=x` |
| `/api/og/[id]` | Optional: open graph image for shared links | n/a | Returns PNG |
| `/account` | Email change, sign out, delete account | Left rail + simple form | Email field, danger zone |
| `https://[slug].goon.so/*` | Public published page | None — served by edge | Generated HTML |

## 6. CORE FEATURES

### 6.1 Auth (NextAuth.js v5, credentials)
- Email + password (bcrypt, 10 rounds). Password min 8 chars enforced client + server.
- JWT session strategy, 30-day expiry, refreshed on activity.
- `auth()` helper used in route handlers and server components for gating.
- Middleware (`middleware.ts`) protects `/dashboard`, `/p/*`, `/account`, `/generate`, `/onboard`, `/api/pages*`, `/api/subdomains*`. Unauthenticated requests to API return 401; to pages redirect to `/signin?returnTo=...`.
- Sign out clears the session cookie and redirects to `/`.

### 6.2 Page generation
- User submits a prompt (1–2000 chars). Server validates length, creates a `Page` row with `status: 'generating'`, then calls the AI in a streaming fashion.
- The AI returns a structured JSON describing sections (array of `{id, type, content}` where types are `hero | features | pricing | testimonials | cta | footer | custom`). The route streams the parsed sections to the client via SSE; the client renders the preview incrementally by composing a full HTML document from a small set of section templates, filling in the AI's content.
- The composed HTML is stored on the `Page` row as `html` and `sections_json`. This is the source of truth for both editor preview and public serving.
- If the AI call fails, `status: 'error'`, error stored, UI shows "Generation failed. Try again or edit your prompt."

### 6.3 QA scoring system

Two passes run after generation (and after any section regeneration), each in ≤3s target.

**Pass A — Hallucinated layout detection (static analysis)**
- Parse the generated HTML with `linkedom` or `parse5` in a Node worker.
- Checks (each returns `{name, status: 'pass'|'warn'|'fail', value, detail}`):
  1. **Section count** — warn if <2, fail if >8.
  2. **Empty section** — fail if any section's primary text node is empty or whitespace-only.
  3. **Duplicate section types** — warn if two sections of the same type appear back-to-back.
  4. **Broken links** — fail if any `<a href>` is empty, `javascript:`, or `{{placeholder}}`-style template leftover.
  5. **Image src validity** — fail if any `<img>` has `src` starting with `data:` longer than 2KB (likely hallucinated) or is empty, or is an `https://` URL that 404s on a HEAD request (sampled, max 5 checks).
  6. **Lorem ipsum / template markers** — fail if text contains `lorem ipsum`, `{{`, `}}`, `[your`, or `[insert`.
  7. **Unrendered prompt echo** — warn if the prompt string itself appears verbatim in the body (sign the AI echoed input).
- Score contribution: each fail -15, warn -5, pass 0, normalized to 0–100 from a base of 100, clamped at 0.

**Pass B — Mobile responsiveness (headless render)**
- Spawn a headless browser (Playwright, headless Chromium) only in this pass. To keep cost down, run on a worker process with a 5s per-page budget and a 2-instance pool.
- Set viewport to 375×812 (iPhone 13) and 768×1024 (iPad). For each viewport, take a full-page screenshot, measure:
  1. **Horizontal overflow** — `document.documentElement.scrollWidth > viewport.width` → fail.
  2. **CTA visibility** — locate the first `<a>` or `<button>` whose text matches `/sign\s*up|get\s*started|try|buy|start|join|claim|subscribe|download/i`. If its bounding rect is not within the first 812px of the page → fail with "Primary CTA is below the fold on iPhone 13."
  3. **Text legibility** — compute min computed `font-size` of any visible text node; fail if <12px.
  4. **Touch target size** — collect all interactive elements (`<a>`, `<button>`, `input`); fail if any has width or height <44px.
  5. **Image aspect ratio** — fail if any `<img>` has `naturalWidth === 0` (broken) or computed `height: 0`.
- Score contribution: 40 points for mobile pass, 20 for tablet pass, 40 distributed equally across the 5 checks (8 each). If a check fails on a viewport, those points are lost.

**Combined score** = `0.4 * A + 0.6 * B`, rounded to integer. The score and full report (with `pass|warn|fail`, raw values, and the exact pixel measurements) are stored on the `Page` row as `qa_score` and `qa_report_json`.

The QA pass is exposed via `GET /api/pages/[id]/qa` (returns cached) and `POST` (forces re-run). The editor triggers re-run automatically on any HTML change; the dashboard shows the last cached score.

### 6.4 Publish to web — subdomain claiming
- On publish, client calls `POST /api/pages/[id]/publish` with `{slug}`.
- Server validates slug: `^[a-z0-9](?:[a-z0-9-]{0,38}[a-z0-9])?$`. Reserved list blocks: `www, api, admin, app, dashboard, signin, signup, account, goon, mail, status, help, support, docs, blog, static, cdn, files`.
- Slug uniqueness enforced by a unique index on `Page.subdomain` (nullable; only published pages have one set).
- If available: transaction updates `Page.status='published'`, sets `subdomain`, sets `published_at`. Returns the public URL.
- Wildcard DNS: `*.goon.so` points to the app. Edge middleware (`middleware.ts` with a matcher excluding `/_next/*` and `/api/*`) reads the `Host` header, extracts the subdomain, looks up the `Page` by `subdomain`, and rewrites the request to `/p/[id]/live`. If not found, rewrites to `/404` (a custom 404 styled in the parent app).
- The `/p/[id]/live` route handler returns the stored `html` with `Content-Type: text/html; charset=utf-8`, `Cache-Control: public, max-age=0, s-maxage=60, stale-while-revalidate=300`. Includes a `<meta name="goon-id" content="[id]">` for analytics.
- The "Made with Goon" badge is appended server-side just before `</body>` if `Page.badge_enabled !== false` (user can disable in account settings).
- Republishing is idempotent: same slug, same page, just a `published_at` update.

### 6.5 Dashboard
- Server component fetches pages via the data access layer; client component handles filter/sort/search state via URL params.
- Search is a simple `ILIKE` on title and prompt (Postgres) — no need for full-text in v1.
- Page cards show: title, status pill (Draft / Published / Error), score badge, last edited (relative time in JetBrains Mono: "2h", "yesterday", "Mar 4"), and a thumbnail rendered by an HTML-to-image service (defer: in v1 show a colored block with the first letter of the title in Space Grotesk 600).

### 6.6 Section regeneration
- In the editor, clicking the regenerate icon on a section opens a small inline form.
- POST `/api/pages/[id]/sections/[sectionId]/regenerate` with `{instruction}`. The server calls the AI with the full page context + the instruction, gets back a single section replacement, splices it into the stored HTML and `sections_json`, then triggers a QA re-run.
- The client receives the new HTML and the new QA report via the response; updates state without a full reload.

### 6.7 Account
- View email, sign out, delete account. Delete cascades: all pages, all `qa_reports`, all `subdomains` released (set to null). Returns to `/`.

## 7. DATA MODEL

**Database:** Postgres (via Prisma). The `subdomain` column on `Page` carries the unique constraint; a partial unique index is used so only published pages participate in uniqueness.

```
User
  id            uuid pk
  email         text unique not null
  password_hash text not null
  created_at    timestamptz default now()
  badge_enabled boolean default true

Page
  id              uuid pk
  user_id         uuid fk User.id not null
  title           text not null default 'Untitled page'
  prompt          text not null
  status          text not null  -- 'draft' | 'generating' | 'published' | 'error'
  html            text            -- composed HTML document
  sections_json   jsonb           -- array of {id, type, content}
  qa_score        int             -- 0..100, nullable until first run
  qa_report_json  jsonb           -- {checks: [...], ran_at}
  subdomain       text            -- nullable; unique when present and status='published'
  published_at    timestamptz
  created_at      timestamptz default now()
  updated_at      timestamptz default now()
  error           text            -- populated when status='error'

  -- partial unique index:
  -- CREATE UNIQUE INDEX page_subdomain_unique
  --   ON "Page"(subdomain) WHERE subdomain IS NOT NULL AND status='published';

Session  (NextAuth JWT-backed, no DB table needed for v1; switch to DB sessions later if required)
```

Relationships: `User 1—* Page` (cascade delete).

Indexes: `Page(user_id, updated_at desc)` for dashboard, `Page(subdomain) where subdomain is not null and status='published'` for the wildcard lookup.

## 8. AUTH

**NextAuth.js v5** with the **Credentials provider**, JWT session strategy. No Clerk anywhere. No third-party OAuth in v1 (defer Google/GitHub to a later iteration).

- File: `auth.ts` at the repo root exports `auth`, `handlers`, `signIn`, `signOut` per the v5 convention.
- The credentials provider looks up the user by email, compares bcrypt hash, returns the user object on success. On failure throws `CredentialsSignin` so the UI can show the generic error.
- Session callback adds `user.id` to the session token.
- `middleware.ts` uses `auth` from `auth.ts` to gate protected routes.
- Sign up is a custom flow in `/signup` that calls a server action which creates the `User`, then calls `signIn('credentials', { email, password, redirect: false })` to issue the session.
- Password storage: `bcryptjs` (pure JS, no native build issues). Hashing in a server action only.
- CSRF: NextAuth handles it. State-changing API routes still verify the session; no extra CSRF token needed for same-origin.

## 9. FILES

FILES: ["app/page.tsx","app/(auth)/signup/page.tsx","app/(auth)/signin/page.tsx","app/(auth)/layout.tsx","app/(app)/generate/page.tsx","app/(app)/onboard/page.tsx","app/(app)/dashboard/page.tsx","app/(app)/dashboard/page-client.tsx","app/(app)/p/[id]/page.tsx","app/(app)/p/[id]/editor-client.tsx","app/(app)/p/[id]/live/route.ts","app/(app)/p/[id]/not-found.tsx","app/(app)/account/page.tsx","app/(app)/layout.tsx","app/api/auth/[...nextauth]/route.ts","app/api/pages/route.ts","app/api/pages/[id]/route.ts","app/api/pages/[id]/generate/route.ts","app/api/pages/[id]/sections/[sectionId]/regenerate/route.ts","app/api/pages/[id]/qa/route.ts","app/api/pages/[id]/publish/route.ts","app/api/subdomains/check/route.ts","middleware.ts","auth.ts","auth.config.ts","lib/db.ts","lib/ai.ts","lib/ai/generate-page.ts","lib/ai/regenerate-section.ts","lib/qa/score.ts","lib/qa/checks/layout.ts","lib/qa/checks/mobile.ts","lib/qa/runner.ts","lib/pages/compose-html.ts","lib/pages/slug.ts","lib/pages/sections.ts","lib/subdomains/reserved.ts","lib/auth/password.ts","components/PromptInput.tsx","components/ScoreBadge.tsx","components/QAReportPanel.tsx","components/QAFlagOverlay.tsx","components/PreviewFrame.tsx","components/DeviceToggle.tsx","components/PublishDialog.tsx","components/PageCard.tsx","components/TopBar.tsx","components/LeftRail.tsx","components/GenerationProgress.tsx","components/StatusPill.tsx","components/EmptyState.tsx","components/ui/Button.tsx","components/ui/Input.tsx","components/ui/Textarea.tsx","components/ui/Modal.tsx","components/ui/SegmentedControl.tsx","components/ui/Toast.tsx","prisma/schema.prisma","prisma/seed.ts","styles/globals.css","tailwind.config.ts","public/favicon.svg","app/404/page.tsx","app/icon.svg","app/opengraph-image.tsx"]