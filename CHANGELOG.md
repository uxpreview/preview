# Changelog

All notable changes to the Preview Design System are recorded here, newest first. Each version is a commit on the `claude/primacy-design-system-YDvsP` branch. The system follows semver as documented in [`docs/principles.html`](docs/principles.html#semver). Versions below 1.0 are not used — this repo started at v1.0.

---

## v1.11.0 (in progress) — M3-style IA: tabs, status, doc shell

### QA + consistency sweep — table header semantics

**Changed**
- Added `scope="col"` to documentation spec-table headers across 15 component pages and the landing template, closing a WCAG 2.2 AA header/data-association gap. The link/structure audit now reports zero tables with unscoped `<th>`.
- Fixed a broken related-component link in `components/skeleton` (`../card/` → `../cards/`).

---

### Doc-site 404 page

**Added**
- Site-root `404.html` on the canonical doc shell (top nav, rail, footer, theme), composed from existing parts (`wire-doc-header`, `wire-button`, `wire-card`). GitHub Pages and Vercel serve it on any missing URL.
- Head script resolves a site-root `<base>` so CSS/JS and relative nav/footer links load at any URL depth, and repoints the skip link at the served path.

**Changed**
- `scripts/build-ia.mjs` propagates chrome into `404.html` (added to `targetSet`); `.pa11yci.json` covers it (passes WCAG2AA).

---

### Local navigation variants (feat/local-navigation-variants)

**Added**
- Add `wire-subnav` (Section sub-nav) component and page.
- Rework Side nav page into "Local navigation" hub: variant decision framework, five variants, deep-hierarchy model.
- Promote `wire-sidenav` sublist/parent compositions to stable; add `--sticky` modifier.
- Add 5 verified local-nav citations; fix a stale NN/g URL.

---

### Messaging & feedback group migrated + feedback a11y upgrades (2026-06-05)

Migrates the six Messaging & feedback components onto canonical
3-tab pages and lands targeted accessibility upgrades to each. The
old aggregated `docs/feedback.html` is retired from the IA (kept on
disk, still chrome-synced); its inbound cross-links in Modal, Drawer,
and Tabs now point at the new pages.

**Added**
- Canonical pages: `components/{toast,banner,empty-state,stepper,
  tooltip,skeleton}/index.html` (Usage / Specs / Accessibility).
- Toast assertive variant for errors — `wire-toast--assertive` plus a
  second `role="alert"` / `aria-live="assertive"` live region, fired
  with `data-toast-assertive` or `data-toast-variant="error"` (or
  `assertive: true` on `wireToast`).
- Toast hover/focus pause — the auto-dismiss countdown holds while the
  pointer is over the toast or focus is inside it, then resumes from
  the remaining time (NN/g). `duration: 0` still disables it.
- Tooltip Esc-to-dismiss — `initTooltip` adds `.is-tooltip-dismissed`
  on Escape without moving focus, supplying the *dismissable* leg of
  WCAG 1.4.13 that a CSS-only tooltip cannot meet. The bubble itself
  stays pure CSS.

**Changed**
- Toast and Banner close buttons bumped to 44px targets (WCAG 2.5.5
  enhanced); the toast uses negative margins to keep the glyph compact.
- Stepper now conveys step state to assistive tech, not color alone:
  `aria-hidden` markers, a visually-hidden "Completed:" in finished
  steps, and `aria-current="step"` on the current one.
- `manifest.json` — the six nav + component `ref`s point at
  `components/<slug>/`; `components/index.html` cards flip to Beta via
  `build-ia.mjs`.

---

Restructures the docs IA toward Material Design 3's component-page
shape (tabbed Overview / Specs / Guidelines / Accessibility, sticky
left nav, status pills, prev/next pager) without changing the
grayscale brand register. This first release lands the template
components and migrates Button as the canonical proof; the remaining
29 components migrate in follow-up commits.

**Added**
- `wire-status-pill` — small inline pill for component lifecycle
  status (Stable / Beta / Alpha / Deprecated, plus Pending for
  migration). Differentiates by fill density in grayscale.
- `wire-doc-header` — eyebrow + title + status + lead + meta block
  used at the top of every new component or foundation page.
- `wire-doc-nav` — categorized left navigation with current-item
  highlight and `--pending` state for not-yet-migrated entries.
- `wire-doc-shell` — two-column sticky-nav-plus-main layout that
  every new docs page composes through.
- `wire-doc-pager` — prev/next links at the foot of each page.
- New folder structure: `components/index.html` (categorized
  landing) and `components/buttons/index.html` (full template with
  all four tabs, hash deep-linking).
- `data-wire-tabs-hash` opt-in attribute on `wire-tabs` syncs the
  active tab with `window.location.hash` via History API.
  `#overview`, `#specs`, `#guidelines`, `#accessibility` work as
  deep links and survive browser back/forward.

**Changed**
- `initTabs` in `js/wire.js` extended for hash-based deep-linking.
  Default behavior unchanged when `data-wire-tabs-hash` is absent.
- New top-nav IA on `/components/*` pages: Get started · Foundations
  · Components · Patterns · Resources. Existing `docs/*.html` pages
  keep the old top nav until migrated.

**Deferred**
- Dark mode → v1.12 (focused release once IA settles).
- Cmd-K search → Phase 2 (needs search-index strategy).
- 29 remaining component migrations follow the Button template.

Version 1.10.4 → 1.11.0 (minor: additive, no breaking changes to
existing `wire-*` components or tokens).

---

## v1.10.4 — Logo simplification + mobile wordmark hide

Per user feedback: the v1.10.3 stacked-layers mark still felt busier
than it needed to be, and the full "Preview Design System" wordmark
was eating mobile viewport width without earning its place there.

**Changed**
- Logo simplified to a single-path **folded-document silhouette**:
  a rectangular page shape with the top-right corner clipped at a
  diagonal. One closed `<path>`, one fill (currentColor), zero
  strokes, zero masks. Reads as "document / page / preview" at any
  size without internal noise.
- Topnav wordmark "Preview Design System" gains `u-hidden-mobile`
  so the text disappears below 48em — the logo stands alone on
  phones. Tablet+ keeps the full wordmark next to the mark.
- Brand `<a>` gains `aria-label="Preview Design System"` so screen
  readers still announce the link's destination when the visible
  wordmark is hidden. Footer wordmarks remain visible at all
  widths (no `u-hidden-mobile` there).

Version 1.10.3 → 1.10.4.

---

## v1.10.3 — Logo: stacked-layers redesign

The v1.10.2 viewport-with-content-lines mark was too refined at 28px —
the 2-px strokes blended into the surrounding shape at small render
sizes. Redesigned as a stronger, more iconic glyph that reads
unambiguously as "a logo" at any size.

**Changed**
- Mark is now **two offset rounded rectangles**: a solid filled
  front card with an outlined back card peeking up and to the right.
  Reads as "stacked previews / layered drafts / iterations" — on
  brand for a system whose job is rendering successive previews
  of the same page.
- SVG now carries explicit `width="28" height="28"` attributes so
  the rendered size is correct even if the CSS modifier hasn't loaded
  yet (defensive against host caching).
- `currentColor` throughout — picks up inverse-context color flips
  from the existing modifier.

Version 1.10.2 → 1.10.3.

---

## v1.10.2 — Preview logo mark

Replaces the "P" letter brand-mark with an actual designed glyph. The
v1.10.2 logo was a tiny wireframe-of-a-wireframe: a rounded rectangle
viewport with two horizontal content lines inside. Read as "a page
mockup" at the brand-mark's 28px square. (Refined to the stacked-
layers design in v1.10.3 for better legibility at small sizes.)

**Changed**
- All 21 Preview-branded pages (index, directory, 19 docs) swap
  `<span class="wire-topnav__brand-mark">P</span>` for the inline
  SVG mark. Demo brand marks (hospital "R", university "N") stay as
  letter squares — they represent placeholder organizations, not
  the Preview brand.
- Added a `--logo` modifier on `.wire-topnav__brand-mark` that
  strips the accent background so the SVG inherits text color via
  `currentColor`. Inverse contexts (dark footers / hero bands)
  flip the color automatically.

**Mark spec**
- 28×28 viewBox, 2px strokes, `stroke-linecap: round`.
- Two-line content layout inside a rounded rectangle. Decoded
  visually as "a tiny wireframe page" without being literal.
- `currentColor` throughout — picks up any inverse-context override
  with no extra code.

**Not changed**
- The "Preview Design System" wordmark stays as plain text next to
  the mark — accessible, scalable, searchable. The brand-mark span
  carries `aria-hidden="true"` because the wordmark provides the
  link's accessible name.
- Demo pages' letter marks (R for Riverside, N for Northgate)
  remain — they read as placeholder brand logos for those
  organizations.

Version 1.10.1 → 1.10.2.

---

## v1.10.1 — Brand consistency polish

Patch-level cleanup after the v1.10 rename. No component, page, or
behavior changed.

**Fixed**
- Footer taglines across 13 `docs/*.html` pages still read
  "v1.X · Open-source wireframe system" — drifted out of sync since
  the version they were stamped at. Normalized to a stable
  "Preview Design System · Open-source" that won't bit-rot.
  (The three meaningful taglines — research, validation,
  component-status — keep their content-specific lines.)
- `index.html` footer carried a leftover `v1.1` tagline missed in
  the v1.10 sweep. Same normalization applied.
- `directory.html` page count was off by one (claimed 41; actual is
  42). Lead paragraph and footer both corrected.
- `README.md` claimed "22 demo pages: 19 Riverside + 3 Northgate" —
  actual is "21 demo pages: 18 Riverside + 3 Northgate". Corrected.
- `package.json` `name` was still `wire-design-system`. Renamed to
  `preview-design-system` for brand consistency. Internal-only
  identifier; no consumer impact.

Version 1.10.0 → 1.10.1.

---

## v1.10 — Brand rename: "Preview Design System"

A brand-only rename. The `wire-` class prefix stays because it accurately
names the visual register (wireframe aesthetic); the brand name above it
is what clients see. Minor version, not major — no consumer of the
existing class API has to edit a single line.

**Changed**
- "Wireframe Design System" → "Preview Design System" across every
  HTML title, header, footer, body copy, code sample, doc, and README
  reference (72 occurrences).
- Topnav brand-mark letter: `W` → `P` in all 21 pages that carried it.
- `README.md` rewritten end-to-end to reflect the v1.10 state: 30
  components, 18 docs pages, 22 demo pages, validation tooling, and
  the governance surface (CHANGELOG / CONTRIBUTING / component-status
  / client-overlay). Replaces the v1.1-era inventory that had been
  drifting since the v1.3-v1.9 additions.
- `package.json` version bumped 1.9.0 → 1.10.0.

**Not changed (deliberate)**
- The `wire-` class prefix stays. A prefix rename would be a v2.0
  breaking change for every consumer; the brand-vs-prefix decoupling
  is now noted in `README.md` § Naming.
- File names stay (`css/wire.css`, `js/wire.js`, `data-wire-*`,
  `dataset.wire*`). Same rationale.
- No component CSS or JS behavior changed in this release.

---

## v1.9 — Mobile UX polish: sticky topnav + safe-area + scroll padding

The user-asked addition plus a small mobile-quality sweep. The primary
nav and its drawer trigger now stay reachable while scrolling. iPhone
notch and home-indicator zones are respected. Anchor jumps and
scrollIntoView no longer land targets under the sticky chrome.

**Changed**
- `.wire-topnav` is now `position: sticky; inset-block-start: 0;
  z-index: var(--z-sticky)` at all viewports. Background is opaque
  (already `var(--color-bg)`) so content beneath remains legible.
- `.wire-topnav__inner` minimum height: 3.5rem (56px) on mobile, scales
  to 4.5rem at 48em+. Reclaims ~16px of vertical space on phones.
- `.wire-topnav__brand` long text wraps gracefully (`min-inline-size: 0`
  on the brand, `overflow: hidden` + `text-overflow: ellipsis` on the
  text span). Long brands like "Riverside Medical Center · Portal"
  truncate instead of forcing horizontal overflow on 320px viewports.
- `html` gains `scroll-padding-block-start: 5rem` (6rem at tablet+) so
  every anchor jump and `scrollIntoView()` clears the sticky chrome.
  Heading `scroll-margin-block-start` bumped to match.
- `.wire-help-bar--fixed` respects `env(safe-area-inset-*)` so the bar
  never sits on the iPhone home-indicator gesture strip.
- `.wire-toast-region` respects safe-area insets for the same reason.
- `.wire-drawer` respects safe-area insets at top (notch) and bottom
  (home indicator), and adds `overscroll-behavior: contain` so drawer
  scrolling doesn't chain to the page underneath.

**Verified**
- Form inputs already at 16px (`--text-md`) — no iOS auto-zoom on focus.
- Megamenu (`--z-dropdown` = 100) renders inside the sticky topnav's
  stacking context (z-200) without clipping.
- Drawer (`--z-modal` = 400) and its backdrop (`--z-overlay` = 300) sit
  above the sticky topnav — drawer covers the chrome correctly.

**Out of scope for v1.9** (noted for future)
- `@media (hover: hover)` gating on every `:hover` rule to suppress
  sticky-hover on touch devices. Larger refactor; deferred.
- Hide-on-scroll-down behavior. Requires JS and is debatable UX —
  plain sticky is the right default.

---

## v1.8 — Governance and scale

**Added**
- `CHANGELOG.md` — this file. The historical record from v1.0 forward.
- `CONTRIBUTING.md` — the ten governance rules every new component, page, or pattern follows.
- `docs/component-status.html` — every component tagged `stable`, `beta`, `alpha`, or `deprecated`. The first stable-status declaration for the system.
- `css/client-overlay.example.css` — a runnable template for a client-branded overlay. Re-defines tokens only; loads after `css/wire.css` to override.
- `docs/principles.html` — adds a "Semver policy" section defining what counts as a breaking change vs. an additive change vs. a fix.
- `package.json` — adds a `bundle` script that concatenates the CSS partials into a single `dist/wire.bundle.css` file for production handoff. Opt-in; the no-build promise for development stays.

---

## v1.7 — Validation framework

**Added**
- `docs/validation.html` — protocol page covering Pa11y, Lighthouse, screen-reader audits, visual regression, browser/device/print matrices, and per-page-type performance budgets.
- `.pa11yci.json` — Pa11y CI config against 40 URLs.
- `lighthouserc.json` — Lighthouse CI config asserting a11y ≥ 95 and best-practices ≥ 90 as errors, perf and seo ≥ 90 as warnings.
- `package.json` — dev-only deps and `serve` / `a11y` / `lh` / `visual` / `validate` scripts.

**Honest gaps logged in `validation.html`**: live screen-reader audit, visual regression baselines, first Pa11y + Lighthouse runs.

---

## v1.6 — Healthcare-depth pass

**Added**
- `pages/hospital-portal.html` — logged-in patient dashboard.
- `pages/hospital-booking.html` — multi-step booking, time-picker step (calendar grid + slot grid).
- `pages/hospital-medication.html` — drug-detail archetype with safety banner, severity-tiered side-effect table, when-to-call callouts, similar-medication list.
- `pages/hospital-trial.html` — Phase 2 trial detail with interactive eligibility checker.

Page count: 35 → 39.

---

## v1.5 — Page-archetype completion

**Added**
- `pages/hospital-404.html` — empty-state-heavy error page.
- `pages/hospital-login.html` — patient-portal sign-in form.
- `pages/hospital-search.html` — search results with filter sidebar, active-filter chips, mark-highlighted results, pagination.
- `pages/hospital-settings.html` — portal preferences using the v1.3 secondary-nav pattern with v1.4 modal + toast.
- `pages/university-program.html` — degree-program detail (BA in Cognitive Science).
- `pages/university-faculty.html` — filterable faculty directory.

**Fixed**
- Aligned several pages' form markup to the documented API: `wire-field__label`, nested `wire-checkbox` / `wire-radio` / `wire-toggle` label patterns. Removed invented classes (`wire-label`, `wire-field--inline`, `wire-input--lg`).

Page count: 29 → 35.

---

## v1.4 — Feedback and communication patterns

**Added**
- `css/components/modal.css` + JS — centered dialog with focus trap, Esc close, backdrop click, focus return. Companion to wire-drawer.
- `css/components/toast.css` + JS — slide-in status messages with polite live region. `window.wireToast({title, body, duration})` API.
- `css/components/banner.css` — full-width announcement strip. Subtle / inverse / alert variants. Dismissable.
- `css/components/empty-state.css` — centered or inline layout (visual / title / body / actions).
- `css/components/skeleton.css` — placeholder shapes with shimmer that respects `prefers-reduced-motion`.
- `css/components/stepper.css` — multi-step progress indicator. Horizontal at 48em+, vertical on phones.
- `css/components/tooltip.css` — pure-CSS hover/focus tooltip via `data-wire-tooltip`. WCAG 1.4.13.
- `docs/feedback.html` — single docs page covering all seven patterns with a "pick the lightest pattern" decision matrix.
- `pages/hospital-appointment.html` — appointment-confirmation flow exercising banner / stepper / tooltip / modal / toast / skeleton / empty state.

`docs/research.html` Component basis table: 7 new rows.

---

## v1.3 — Section navigation + research backfill

**Added**
- `wire-sidenav__sublist` and `wire-sidenav__link--parent` — purely additive extensions to the existing sidenav component.
- `docs/navigation.html` — new "Section navigation patterns" section documenting **local nav** (peer pages), **secondary nav** (children of current), and **section tree** (parent + siblings + nested current children).
- `docs/research.html` Component basis table — 16 rows covering every component that previously lacked an Evidence or Convention tag. Added Material Design 3 and IBM Carbon to the Sources list.

**Demoed in real pages**
- `pages/hospital-specialty.html` — local nav stacked above the existing anchor TOC.
- `pages/hospital-research.html` — section tree with labs nested under the current "Active programs" sibling.

---

## v1.2 — Audit pass: mobile + a11y + regression fixes

**Fixed — critical**
- `js/wire.js` was reading `dataset.pAccordion` / `dataset.pTextSizeValue` after the v1.0→v1.1 rebrand renamed HTML attributes to `data-wire-*`. Accordion single-mode and the text-size widget were silently broken. Renamed all three reads to `dataset.wireAccordion` / `dataset.wireTextSizeValue`.

**Fixed — WCAG**
- 1.1.1 — added `aria-hidden="true"` to 103 decorative `.wire-media` placeholders.
- 2.4.6 — collapsed multi-`h1` pages (`docs/heroes.html`, `docs/typography.html`, `index.html`) to one page-level `<h1>` each.
- 2.5.8 — bumped `.wire-tag--sm` 20px → 24px (AA floor). Bumped `.wire-text-size__btn` 32px → 44px (AAA / Apple HIG).
- 4.1.3 — text-size widget now announces scale changes via a polite live region.

**Fixed — mobile reflow**
- `.wire-inpagenav` becomes `position: static` below 48em.
- `.wire-gallery--mosaic` collapses to single column below 48em.
- `.wire-help-bar` switches to `flex-direction: column` on phones.

**Fixed — print**
- `print.css` force-expands every `<details>` child so collapsed accordion content isn't lost on paper.

**Added**
- `--color-overlay-light` token. Replaced the only hardcoded `rgba()` in component CSS (`tag.css:68`).

---

## v1.1 — Initial WCAG 2.2 AA audit pass

**Added**
- `docs/research.html` — single page documenting evidence basis with one citation per claim. WCAG 2.2 AA compliance map.
- `css/print.css` — print stylesheet stripping chrome, expanding tabs/accordions, appending link URLs.
- `css/components/help-bar.css` — persistent contact affordance (NIA recommendation).
- `css/components/text-size-control.css` — A− / A / A+ / A++ widget with localStorage persistence.
- `pages/hospital-measure.html` — research-measure detail archetype.
- `css/components/citation-list.css` + `wire-tag--sm` modifier.
- `directory.html` — flat index of every page plus external references.

**Fixed — WCAG**
- 1.4.11 — `--color-border-strong` from gray-40 (2.4:1) to gray-50 (4.5:1).
- 2.4.7 — `--color-focus` overridden to white on every dark-surface component (`.u-bg-inverse`, `.wire-hero--inverse`, `.wire-footer--inverse`, `.wire-callout--inverse`).
- 2.1.2 — drawer focus trap implemented (modal dialog pattern).
- 2.4.11 — `scroll-margin-block-start` on headings for anchor-jump clearance.
- 2.5.8 — breadcrumb / footer / in-page-nav / mega-menu link targets bumped to ≥ 28px.
- 4.1.3 — button loading state triggers on `[aria-busy="true"]` with sr-only "Loading…" text.

**Removed**
- `Primacy` and `SRALab` references purged from class prefixes, file names, and copy. The system now ships as a generic, unbranded wireframe kit. `p-` → `wire-`. `data-p-*` → `data-wire-*`. SRALab demo pages → "Riverside Medical Center" placeholder.

---

## v1.0 — Foundations

**Added**
- Token layer: grayscale ramp, type scale, spacing, radii, borders, shadows, motion, breakpoints, z-index.
- 25 components under the `wire-` prefix: button, badge, tag, divider, breadcrumb, pagination, form, nav (topnav / megamenu / sidenav / inpagenav / drawer), card, hero, feature-grid, two-column, accordion, tabs, callout, quote, timeline, media, list, table, footer.
- Layout utilities: `u-container`, `u-stack`, `u-cluster`, `u-grid`, `u-sidebar`, `u-section`, `u-bg-*`, `u-text-*`.
- `js/wire.js` — single vanilla-JS file auto-initializing tabs, accordion, megamenu, drawer, in-page scroll-spy.
- Docs pages for principles, tokens, typography, and each component family.
- 9 hospital demo pages (Riverside) + 1 higher-ed demo (Northgate homepage).
- No build step. Open `index.html` in a browser, it works.
