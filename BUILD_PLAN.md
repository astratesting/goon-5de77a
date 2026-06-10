# Goon — Build Plan

## 1. PRODUCT

Goon is an AI page builder for non-technical entrepreneurs who need to ship landing pages fast without learning CSS. The existing product generates pages via AI, scores them for quality, and publishes to a subdomain. This release deepens the **QA loop** so a non-technical user can see — in plain language — whether their page is actually good on mobile (where most traffic lands), and it tightens the **publish flow** with safer subdomain validation, an inline live preview, and copy-paste DNS instructions. The core value: ship a working, mobile-ready page without becoming a developer, with the QA report acting as a trusted checklist the user can act on in one click.

## 2. WHO IT'S FOR

- **Solo founders and side-project builders** who don't know CSS, can't tell why a page "looks broken" on their phone, and get stuck at the publishing step.
- **Operations-impaired** — they want one thing to do next at any moment, not a settings maze.
- **Visually trusting, skeptically minded** — they need to *see* the preview, *see* the score, *see* the issues; they won't act on a vague number.
- Tone: warm, plain-spoken, no jargon. "Tap target too small" is fine. "Insufficient click-area for FATAL viewport interaction" is not.
- Implications: every screen opens on the single next action; QA labels are human; publish gives a working URL or a copyable fix; no invented logos/quotes anywhere.

## 3. LOOK & FEEL

**Visual system (unchanged palette, tightened usage):**
- Background base: deep indigo `#0B0F1F` with subtle radial gradient `#0E1430 → #0B0F1F`.
- Accents: cyan `#22D3EE`, teal `#14B8A6`, violet `#8B5CF6`, coral `#FB7185`, honey `#F5B544` (used for warnings/attention in QA).
- Surfaces: elevated cards `#121A35` with 1px border `rgba(255,255,255,0.06)`, radius 14px.
- Type: Manrope (headings, UI, 600/700), Source Sans 3 (body, 400/500). Numeric scores: Manrope 700 tabular.
- Spacing: 8px base. Section padding 24/32. Max content 1120px.
- Iconography: stroke icons 1.5px, rounded caps, color `currentColor` so they inherit text. No filled icons.
- Imagery: gradient/mesh hero accents, screenshot thumbnails of real generated pages (no stock people). No fake customer logos.
- Motion: 150ms ease-out for hover; 250ms for state changes; respect `prefers-reduced-motion`. Score ring animates from 0 to value over 600ms on mount.

**Screen-by-screen:**

### `/` Landing (unchanged system, no rebuild)
- Keep current dark indigo/cyan hero. Add one new block above footer: **"Built-in QA, before you publish"** — three small cards: Mobile-ready check, Live preview, One-click publish. Each card uses a mini device-frame mock with the QA score ring. No invented metrics.

### `/login` and `/register`
- Centered card on gradient backdrop, max-width 420px. Email + password. Below the form: one-line helper text. No "social proof" placeholders. Errors render inline under the field in coral with a small icon.

### `/dashboard` (enhanced)
- Top bar: "Pages" title, search input (filters by title/subdomain), "+ New page" primary button (cyan).
- Grid of page cards (3 cols ≥1024px, 2 cols ≥640px, 1 col below). Each card:
  - Thumbnail (16:10) — first frame of live preview, screenshot.
  - Title (truncate 1 line) + subdomain pill `yourname.goon.app` (muted).
  - Score ring (top-right of thumbnail) — large number, label "QA".
  - Status row: draft / published • last edited "2h ago" • mobile badge (green/amber/red).
  - Hover: thumbnail sharpens 4%, border becomes cyan 40%.
- Empty state: illustration of a device with dashed outline, headline "No pages yet", sub "Describe your idea and Goon builds the first version", CTA.
- Right side (or bottom on mobile): **QA summary card** — average score, # of pages with mobile issues, # unpublished. Links to `/dashboard/qa`.

### `/dashboard/qa` (new — QA Report)
- Header row: "QA Report" + filter chips: All / Mobile / Accessibility / SEO / Performance. Sort: score asc/desc, last edited.
- Table (cards on mobile):
  - Columns: Page, Score (ring + number, color by band: ≥90 cyan, 70–89 teal, 50–69 honey, <50 coral), Mobile badge, # issues, Last scanned, "View" → `/dashboard/qa/[pageId]`.
- Top summary strip (4 stat tiles): Avg score, Pages scanned, Mobile-ready count, Total open issues.
- Bulk action: "Re-scan all" (cyan ghost button). Subtle progress bar appears below header while scanning.

### `/dashboard/qa/[pageId]` (new — single page QA detail)
- Two-column on ≥1024px, stacked below.
- Left (60%): rendered preview of the page inside a device frame toggle (Mobile 375 / Tablet 768 / Desktop 1280). Frame is draggable vertically. The viewport meta tag overlay shows current width.
- Right (40%): **Score breakdown** panel.
  - Big score ring (160px) with band label "Good / Needs work / Poor".
  - Category list: Mobile, Layout, Typography, Accessibility, SEO, Performance. Each row: bar, score, expand chevron.
  - Expanded row shows issues: each issue = icon (red/coral/amber), title, one-sentence why-it-matters, "Fix" button where auto-fixable, "Show in preview" jumps the device frame to the element and pulses a highlight.
- Bottom: **Suggestions** list (AI-generated plain-English fixes, max 5, "Regenerate" replaces them).

### `/dashboard/pages/[id]` (page editor — minimal extension)
- Existing editor. New: **"QA"** tab next to "Content" / "Style" / "Publish". QA tab shows a compact version of the report (score ring + top 3 issues + "Open full report" link). Tabs share a sticky header with score ring always visible so the user sees the impact of edits.

### `/dashboard/pages/[id]/publish` (improved)
- Stepper at top: 1 Subdomain → 2 Preview → 3 DNS → 4 Publish.
- **Step 1 — Subdomain:** input with prefix rules shown live. Validation rules:
  - 3–32 chars, lowercase, `a-z 0-9 -`, cannot start/end `-`, cannot contain `www`, `api`, `admin`, `mail`, `app`. Reserved list enforced server-side.
  - Live availability check with 300ms debounce, 3-state pill: available (teal), taken (coral with "Taken" + 2 suggestions like `myname2`, `mynamehq`), invalid (honey with reason).
- **Step 2 — Live preview:** iframe to the unpublished render route, with device toggle (375/768/1280), zoom slider, refresh. Side panel: "This is exactly what visitors will see" + score ring.
- **Step 3 — DNS:** if on custom domain, show a card with copyable records:
  - For `goon.app` subdomain: just confirm.
  - For custom domain: two rows: CNAME `www → cname.goon.app`, A `@ → 178.105.231.73`. Each row has copy button and "✓ Verified" / "Pending" status.
- **Step 4 — Publish:** primary button "Publish now". On success: confetti-free success state, show URL, "Copy", "Open", "Share". On error: coral banner with the specific error and a "Back to fix" link.

### `/dashboard/settings`
- Profile (name, email read-only). Subdomain claim (one per user). Danger zone: delete account (requires typing "DELETE"). No fake "plan" UI.

### `/p/[subdomain]` and `/p/[subdomain]/[slug]` (public)
- Render the published page. Set `viewport` meta with `width=device-width, initial-scale=1, viewport-fit=cover` (validated by QA). Include `<meta name="theme-color">` matching the page's primary.

---

## 4. USER FLOWS

**F1 — Sign up & first page**
1. `/register` → submit email/password → `/dashboard` (empty state).
2. Click "+ New page" → modal: text area "Describe your page" + tone chips (Friendly, Bold, Minimal). Submit.
3. Generation state: progress strip "Building layout… Writing copy… Checking mobile…" (≤30s, polled every 2s).
4. Lands in editor. **Auto-runs QA** in background; on complete, score ring in header animates in and toast: "Built and scored. Tap to review" → opens QA detail.

**F2 — Edit → re-score**
1. Edit content in editor.
2. Save (auto-save every 5s of idle).
3. Re-score triggered on save. Score ring transitions to new value with delta "+3" / "−7" pill for 3s.
4. If score drops below 70, the QA tab shows a honey dot; clicking opens the detail with the offending category expanded.

**F3 — Publish (subdomain path)**
1. Editor → "Publish" tab → Step 1: type `myidea` → debounced check → teal "Available".
2. Step 2: preview loads, toggle to mobile, confirm it looks right.
3. Step 3: skipped (subdomain on `goon.app`).
4. Step 4: "Publish now" → 1.5s simulate → success card with `myidea.goon.app`, Copy/Open buttons.
5. If user later adds a custom domain, Step 3 reappears in `/dashboard/pages/[id]/publish` with DNS records.

**F4 — Publish (custom domain path)**
1. Step 1 same.
2. Step 2 same.
3. Step 3: enter `mydomain.com` → records shown, copy buttons, "Verify" button (calls DNS check API; on fail, show which record failed with the actual values queried).
4. Step 4: "Publish" enabled only when Step 3 verified.

**F5 — QA Report review**
1. `/dashboard/qa` → see all pages sorted by score asc.
2. Click a row → `/dashboard/qa/[pageId]` → expand Mobile category → "Show in preview" highlights a too-small button at 375px.
3. Click "Fix" (auto-fix: bumps button padding to meet 44px) → preview re-renders → score updates with delta.

**F6 — Errors & edge states**
- Subdomain taken: suggestions appear; can pick one with one click.
- Preview fails to load: retry button + last error in muted text; "Open raw HTML" link.
- DNS check timeout: "We couldn't reach your DNS. Verify manually or try again in 60s." (no fake spinner).
- QA scan fails for a page: row shows "Scan failed" with a small re-scan icon. No silent failure.

---

## 5. PAGES / ROUTES

| Route | Purpose | Layout / Key elements |
|---|---|---|
| `/` | Marketing landing | Existing. Add "Built-in QA" 3-card block. |
| `/login` | Sign in | Centered card, indigo gradient bg. |
| `/register` | Sign up | Same shell as login, with name field. |
| `/dashboard` | Pages overview | Grid of page cards + QA summary card. |
| `/dashboard/qa` | QA Report list | Filter chips, table/cards, summary tiles. |
| `/dashboard/qa/[pageId]` | QA detail | Device-framed preview + score breakdown + suggestions. |
| `/dashboard/pages/new` | New page modal (overlay) | Prompt + tone chips. |
| `/dashboard/pages/[id]` | Editor | Existing + QA tab. |
| `/dashboard/pages/[id]/publish` | Publish flow | 4-step stepper. |
| `/dashboard/settings` | Account settings | Profile, subdomain claim, danger zone. |
| `/api/auth/[...nextauth]` | NextAuth v5 handler | Existing. |
| `/api/qa/scan` | POST: run QA on a page | Returns score + issues. |
| `/api/qa/pages` | GET: list pages with scores | Cached 30s. |
| `/api/publish/check-subdomain` | GET: availability + rules | Debounced from UI. |
| `/api/publish/preview` | GET: render unpublished page | Returns HTML + assets map. |
| `/api/publish/dns-check` | POST: verify DNS | Returns per-record status. |
| `/api/publish/commit` | POST: finalize publish | Returns public URL. |
| `/p/[subdomain]` | Public published page | SSR with viewport meta. |
| `/p/[subdomain]/[slug]` | Public page slug | SSR. |
| `/preview/[pageId]` | Authenticated preview render | Used by Publish step 2. |

---

## 6. CORE FEATURES

### 6.1 Enhanced QA Scoring Engine (`lib/qa/`)
- **Inputs:** page HTML, parsed CSS (via `postcss` or `cheerio` + regex on `<style>`), computed list of interactive elements, image URLs.
- **Categories & weights:** Mobile 35, Layout 15, Typography 10, Accessibility 15, SEO 15, Performance 10. Each yields 0–100; final is weighted average rounded.

**Mobile checks (the focus of this release):**
- `viewport-meta` — must contain `width=device-width` and not `user-scalable=no` (warn, not fail). Missing → score 0 for mobile category.
- `responsive-css` — scan inline + linked `<style>` for `media (min-width|max-width)`, `clamp(`, `%`/`vw`/`vh` units, flex/grid. Flag any element with fixed `width` in px that exceeds 360 and has no responsive counterpart. Hard fail if no responsive tokens detected on a > 600px hero block.
- `touch-targets` — extract `<a>`, `<button>`, `[role=button]`, `<input>`; compute bounding box (heuristic: padding-y from CSS, fallback 12px). Flag any < 44×44 px (Apple HIG) or < 48×48 dp (Material). Severity scales with how small.
- `image-scaling` — every `<img>` must have either `srcset`, `sizes`, `max-width:100%`, or `width` attribute. Flag `<img>` wider than container (computed by parsing parent width or defaulting to 375). Flag missing `loading="lazy"` on below-fold images (best-effort: anything after 2nd viewport).
- `horizontal-overflow` — render DOM in headless check (or static heuristic: sum of `min-width` declarations; any `width: 100vw`; negative margins) to predict horizontal scroll at 375px. Any prediction → fail.
- `font-sizes` — minimum body text 16px. Flag any computed `font-size < 14px` for body, `<12px` for any text.
- `meta-viewport-zoom` — warn if `maximum-scale=1` (accessibility concern).

**Other categories:**
- **Layout:** sections have consistent max-width, no overlapping fixed elements, no z-index > 50 outside modals.
- **Typography:** heading hierarchy (one h1, no skipped levels), line-height 1.2–1.6 for body.
- **Accessibility:** color contrast (parse colors, compute WCAG ratio for text on background pairs flagged in component list), alt text on images, form labels, focus-visible styles present.
- **SEO:** `<title>` 30–60 chars, `<meta name="description">` 70–160, single `<h1>`, canonical present, OpenGraph tags.
- **Performance:** total HTML size < 150KB, image count < 20, no render-blocking external scripts on initial render, no fonts > 2.

**Output shape:**
```ts
type QAResult = {
  pageId: string;
  scannedAt: string;
  overall: number;          // 0-100
  band: 'good' | 'fair' | 'poor';
  categories: { id: string; score: number; issues: QAIssue[] }[];
  suggestions: string[];    // plain English, max 5
};
type QAIssue = {
  id: string;               // e.g. 'mobile.touch-target'
  severity: 'fail' | 'warn' | 'info';
  selector?: string;        // for "Show in preview"
  title: string;            // "Tap target too small"
  detail: string;           // one sentence
  autoFix?: { action: 'bump-padding' | 'add-viewport' | 'lazy-load' | 'set-srcset'; params?: any };
};
```

**Auto-fix actions** (limited set, safe): bump button padding to 12px 20px; inject `<meta name="viewport">`; add `loading="lazy"`; add `srcset` from same URL at 1x/2x hint.

### 6.2 QA Report Dashboard
- Server component fetches list of pages with their last `QAResult`. Aggregation: avg, mobile-ready count (mobile score ≥ 80), total open issues (count of `fail`).
- Filters: category (chips), sort (score asc default).
- Re-scan: POST `/api/qa/scan` with `pageId` or `all=true`. Server queues and returns job id; client polls or uses SSE. For this release, simple 1.5s simulated scan with progress bar; actual scan runs server-side on the same data the editor uses.

### 6.3 QA Detail View
- Device frame: pure CSS, no iframes for the static screenshot (render an SVG/HTML mock with the page's sections stacked at the chosen width). For real HTML preview, embed in sandboxed iframe with `sandbox="allow-same-origin"`.
- "Show in preview" scrolls the iframe content and overlays a pulsing outline on the matched selector (uses `postMessage` to a small script in the preview route).
- "Fix" buttons call `/api/qa/autofix` with `{ pageId, issueId }`; on success, re-scan and animate score.

### 6.4 Publish — Subdomain Validation
- Client + server share the same rule set in `lib/publish/subdomain.ts`.
- Reserved list: `www, api, admin, mail, app, dashboard, cdn, static, assets, goon, support, status, blog, help, docs, auth, login, register, signup, signin`.
- Server check: in-memory LRU + DB unique constraint. On collision, return up to 3 suggestions via algorithm: append 2, append `hq`, prepend `get`.

### 6.5 Publish — Live Preview
- New route `/preview/[pageId]` returns the page's compiled HTML with relative asset paths rewritten to absolute. Auth-gated (must be owner).
- Publish step 2 iframes it; device toggle sets iframe width via wrapper.

### 6.6 Publish — DNS Instructions
- Detect if user is on free subdomain (`*.goon.app`) → skip Step 3.
- Custom domain → render two record cards with copy buttons. `Verify` calls `/api/publish/dns-check` which does `dns.resolveCname` / `dns.resolve4` (Node) on the host; returns `{ record, expected, actual, ok }` per record.
- Show actual vs expected diff on failure so the user knows what to change.

### 6.7 Editor QA Tab
- Reads latest `QAResult` for the page. Renders score ring + top 3 issues. "Open full report" deep-links to `/dashboard/qa/[pageId]`.
- Re-scan button runs a scan and shows a 600ms determinate progress.

### 6.8 Caching & Invalidation
- QA results stored in `qa_results` table, keyed by `pageId` + `version` (incremented on save). Cache TTL 5 min. Editor save → invalidate + new version.

---

## 7. DATA MODEL

```ts
// users (NextAuth-managed; extend in prisma)
User {
  id: string (cuid)
  email: string
  name: string?
  image: string?
  createdAt: DateTime
  // app-specific
  claimedSubdomain: string?  // unique, one per user, optional
}

Page {
  id: string (cuid)
  ownerId: string → User.id
  title: string
  prompt: string               // original generation prompt
  tone: 'friendly' | 'bold' | 'minimal'
  html: string                 // generated/edited HTML
  css: string                  // generated/edited CSS
  meta: Json                   // { description, ogImage, themeColor }
  version: number              // increments on save
  status: 'draft' | 'published' | 'archived'
  createdAt: DateTime
  updatedAt: DateTime
  // relations
  subdomain: Subdomain?
  publish: PublishRecord?
  qaResults: QAResult[]
}

Subdomain {
  id: string
  pageId: string → Page.id
  host: string                 // e.g. "myidea" or "myidea.goon.app" (stored as full host)
  isCustom: boolean
  verified: boolean
  createdAt: DateTime
  @@unique([host])
}

PublishRecord {
  id: string
  pageId: string → Page.id
  publishedAt: DateTime
  publishedVersion: number
  dnsRecords: Json?            // [{ type, name, value }] for custom domains
}

QAResult {
  id: string
  pageId: string → Page.id
  version: number              // matches Page.version at scan time
  overall: number
  band: 'good' | 'fair' | 'poor'
  categories: Json             // QAResult.categories
  suggestions: string[]        // stored as Json string[]
  scannedAt: DateTime
  @@index([pageId, scannedAt])
}
```

Relationships: User 1—* Page, Page 1—1 Subdomain, Page 1—* QAResult, Page 1—* PublishRecord.

---

## 8. AUTH

- **NextAuth.js v5** (existing). Providers: credentials (email + bcrypt) + optional GitHub (existing).
- Session strategy: JWT for edge middleware compatibility; database sessions not required.
- Middleware (`middleware.ts`) protects `/dashboard/**`, `/api/qa/**` (write), `/api/publish/**` (write), `/preview/**`. Public: `/`, `/login`, `/register`, `/p/**`, `/api/auth/**`.
- Owner check: every mutating API verifies `session.user.id === resource.ownerId` via a `withAuth(handler)` wrapper.
- No Clerk anywhere. No third-party auth UI components.

---

## 9. CORE FEATURES → BUILD MAPPING

- **QA engine** → `lib/qa/scan.ts`, `lib/qa/rules/mobile.ts`, `lib/qa/rules/accessibility.ts`, `lib/qa/rules/seo.ts`, `lib/qa/rules/typography.ts`, `lib/qa/rules/performance.ts`, `lib/qa/rules/layout.ts`, `lib/qa/autofix.ts`, `lib/qa/score.ts`.
- **QA Report UI** → `app/dashboard/qa/page.tsx`, `app/dashboard/qa/[pageId]/page.tsx`, `components/qa/ScoreRing.tsx`, `components/qa/CategoryRow.tsx`, `components/qa/IssueRow.tsx`, `components/qa/DeviceFrame.tsx`, `components/qa/SummaryTiles.tsx`.
- **Editor QA tab** → `app/dashboard/pages/[id]/qa-tab.tsx`.
- **Publish flow** → `app/dashboard/pages/[id]/publish/page.tsx`, `components/publish/Stepper.tsx`, `components/publish/SubdomainInput.tsx`, `components/publish/PreviewPane.tsx`, `components/publish/DnsCard.tsx`, `components/publish/SuccessCard.tsx`, `lib/publish/subdomain.ts`, `lib/publish/dns.ts`.
- **Public render** → `app/p/[subdomain]/page.tsx`, `app/p/[subdomain]/[slug]/page.tsx`, `app/preview/[pageId]/page.tsx`.
- **API** → `app/api/qa/scan/route.ts`, `app/api/qa/pages/route.ts`, `app/api/qa/autofix/route.ts`, `app/api/publish/check-subdomain/route.ts`, `app/api/publish/preview/route.ts`, `app/api/publish/dns-check/route.ts`, `app/api/publish/commit/route.ts`.
- **Data** → `prisma/schema.prisma` (add models), `lib/db.ts`.
- **Auth glue** → `auth.ts`, `middleware.ts`, `lib/auth/withAuth.ts`.

---

## 10. ACCEPTANCE

A reviewer should be able to confirm each of the following as **done and working**:

**Auth & shell**
- [ ] Sign up, sign in, sign out work; session persists; protected routes redirect to `/login`.
- [ ] No Clerk in `package.json` or imports; NextAuth v5 only.
- [ ] Landing page renders the existing dark indigo/cyan design unchanged, plus the new "Built-in QA" 3-card section.

**QA engine**
- [ ] Scanning a page that lacks a viewport meta returns mobile score 0 and an issue titled "Missing viewport meta" with `autoFix: add-viewport`.
- [ ] A page with a 30×30 px button on mobile triggers a "Tap target too small" issue with the button's selector.
- [ ] An `<img>` with no `srcset`, `sizes`, or `max-width:100%` triggers an "Image may overflow on mobile" issue; offers `autoFix: set-srcset` and `loading-lazy`.
- [ ] Detects at least one responsive token (`@media`, `clamp(`, `vw/vh`, or `%`) and marks `responsive-css` passed; a page of only fixed px widths fails it.
- [ ] Predicts horizontal overflow when `width: 100vw` or a fixed-width section > 375px is present.
- [ ] Final score is a weighted average of the 6 categories, rounded, and band matches thresholds (≥90 good, 70–89 fair, <70 poor).
- [ ] All issues have a selector (or `null` for global) and a one-sentence `detail`.

**QA Report**
- [ ] `/dashboard/qa` lists all owner pages with their latest score and mobile badge.
- [ ] Filter chip "Mobile" shows only pages with at least one mobile-category issue.
- [ ] Sort by score ascending puts the lowest first.
- [ ] Summary tiles show correct counts; "Re-scan all" updates at least one row.
- [ ] `/dashboard/qa/[pageId]` shows device-frame preview at 375/768/1280; "Show in preview" highlights the matched element with a pulsing outline.
- [ ] "Fix" on an auto-fixable issue updates the page HTML, re-scans, and the score ring animates to the new value with a delta pill.

**Publish**
- [ ] Subdomain input rejects `WWW`, `api`, `myname!`, `a`, and a 40-char string with inline reasons; accepts `my-idea-2`.
- [ ] Debounced availability check returns available/taken/invalid within 500ms of typing.
- [ ] On taken, at least 2 suggestions appear and are clickable to fill.
- [ ] Publish step 2 loads `/preview/[pageId]` in an iframe; device toggle changes visible width.
- [ ] For a custom domain, Step 3 shows CNAME and A records with working copy buttons and a "Verify" that returns real DNS results (ok or per-record diff).
- [ ] Step 4 is disabled until Step 3 verified; on success, the public URL renders at `/p/[subdomain]` with a correct viewport meta tag.

**Honesty**
- [ ] No invented customer quotes, logos, user counts, ratings, or revenue figures anywhere in the UI.
- [ ] Empty states are honest ("No pages yet", not "Your first amazing page is one click away!").
- [ ] Copy uses plain language; no developer jargon in user-facing strings.

**Build**
- [ ] `pnpm build` succeeds; `pnpm typecheck` clean; no `any` leaks in QA types.
- [ ] `pnpm dev` serves the app at the configured port; preview link from prior deploy still works as a smoke test.

---

## FILES

```json
[
  "prisma/schema.prisma",
  "lib/db.ts",
  "lib/qa/scan.ts",
  "lib/qa/score.ts",
  "lib/qa/autofix.ts",
  "lib/qa/rules/mobile.ts",
  "lib/qa/rules/typography.ts",
  "lib/qa/rules/accessibility.ts",
  "lib/qa/rules/seo.ts",
  "lib/qa/rules/performance.ts",
  "lib/qa/rules/layout.ts",
  "lib/publish/subdomain.ts",
  "lib/publish/dns.ts",
  "lib/publish/render.ts",
  "lib/auth/withAuth.ts",
  "auth.ts",
  "middleware.ts",
  "app/dashboard/page.tsx",
  "app/dashboard/qa/page.tsx",
  "app/dashboard/qa/[pageId]/page.tsx",
  "app/dashboard/pages/[id]/page.tsx",
  "app/dashboard/pages/[id]/qa-tab.tsx",
  "app/dashboard/pages/[id]/publish/page.tsx",
  "app/dashboard/settings/page.tsx",
  "app/p/[subdomain]/page.tsx",
  "app/p/[subdomain]/[slug]/page.tsx",
  "app/preview/[pageId]/page.tsx",
  "app/api/qa/scan/route.ts",
  "app/api/qa/pages/route.ts",
  "app/api/qa/autofix/route.ts",
  "app/api/publish/check-subdomain/route.ts",
  "app/api/publish/preview/route.ts",
  "app/api/publish/dns-check/route.ts",
  "app/api/publish/commit/route.ts",
  "components/qa/ScoreRing.tsx",
  "components/qa/CategoryRow.tsx",
  "components/qa/IssueRow.tsx",
  "components/qa/DeviceFrame.tsx",
  "components/qa/SummaryTiles.tsx",
  "components/qa/PreviewHighlighter.tsx",
  "components/publish/Stepper.tsx",
  "components/publish/SubdomainInput.tsx",
  "components/publish/PreviewPane.tsx",
  "components/publish/DnsCard.tsx",
  "components/publish/SuccessCard.tsx",
  "components/dashboard/PageCard.tsx",
  "components/ui/Button.tsx",
  "components/ui/Input.tsx",
  "components/ui/Tabs.tsx",
  "styles/qa.css"
]
```