# Styles section — build out + consolidate

**Date:** 2026-06-10
**Status:** Approved (pending spec review)
**Author:** Ryan McCarty (with Claude)
**Supersedes/relates:** Follows the Foundations build-out (2026-06-08) and the
manifest-driven nav model (`2026-06-02-nav-ia-rework-design.md`). Same pattern,
applied to the **Styles** section: this spec does not change the nav mechanism,
only the `ref`s it points at and the pages behind them.

---

## 1. Summary

The **Styles** section is half-built. Its landing (`styles/index.html`) and nav
exist, five of seven child pages are written (Typography, Iconography, Elevation,
Motion, Tokens), but two are "Planned" stubs (**Color & theming**, **Shape &
radius**), and the section is physically split: the two stubs live in `styles/`
while the five built pages live in `docs/`.

Three things happen, in one coordinated pass:

1. **Relocate** the five built pages from `docs/` into `styles/` so the section
   is self-contained, driven by the manifest + `build-ia.mjs`, with redirect
   stubs left at the old `docs/` paths.
2. **Build** the two stub pages — Color & theming and Shape & radius — to the
   established page anatomy, filled with the system's real tokens.
3. **Normalize** all seven pages so they read as one section (breadcrumbs,
   pager chain, eyebrow, heading levels, landing-card copy).

## 2. Goals / non-goals

**Goals**
- A complete, coherent, self-contained `styles/` section — all seven pages
  present and consistent.
- The two new pages document real, existing tokens with live demos, matching the
  quality bar of the built pages.
- No dead links anywhere; old `docs/` URLs keep resolving.
- Faithful to the system: grayscale, tokens-only, BEM `wire-`, **no new tokens,
  no new components, no restyling**. Pages document what exists; they don't add to it.
- Every non-obvious claim tiered and cited to `citations.json`; no invented citations.

**Non-goals**
- No new design tokens or components. If something seems missing, the page says so;
  it does not invent it.
- No SRAL / client-specific content. The core stays grayscale and client-agnostic.
  (A generic "per-client overlay" note on Color & theming describes the existing
  extension lane in the abstract only.)
- No rewrite of the five built pages — audit fixes divergences only.
- No folder-slug churn beyond the five-file move (the nav rail chrome is untouched).

## 3. Current state (verified)

- `manifest.json` → `nav` → "Styles" section (lines ~4442–4489): seven `page`
  items. Two carry `"status": "planned"` and point at `styles/`; five point at
  `docs/`.
- Nav is generated from that block by `scripts/build-ia.mjs` and injected between
  `<!-- NAV:START -->` / `<!-- NAV:END -->` into every doc-chrome page (~164),
  which is why each `docs/<page>.html` shows ~168 inbound references — almost all
  are the propagated nav, not real content links.
- Built page anatomy (e.g. `docs/elevation.html`): `u-section` → `u-container--wide`
  → `wire-breadcrumb` → `wire-doc-header` (`__row` + `__title`) → `wire-shell__doc`
  → `u-stack u-stack--3xl` wrapping `<section class="doc-section" id="…">` blocks
  (each `wire-h3` + `doc-example` live demos + `wire-table` token tables) →
  `wire-inpagenav` → `wire-doc-pager`. Page-local demo CSS lives in an inline
  `<style>` in the head (e.g. `.el-swatch`) — acceptable for doc-chrome pages.
- Token material in `css/tokens.css`: 13-step grayscale ramp (`--gray-00`…`--gray-100`);
  semantic aliases (`--color-bg*`, `--color-text*`, `--color-border*`, `--color-accent*`,
  `--color-focus`, `--color-overlay*`); `[data-theme="dark"]` override block;
  radii (`--radius-xs`…`--radius-2xl`, `--radius-pill`); border weights; shadows.

## 4. End-state architecture

`styles/` contains all seven pages and their landing:

```
styles/index.html            (landing — exists; cards re-pointed to styles/*)
styles/color-theming.html    (NEW — replaces stub)
styles/typography.html       (moved from docs/)
styles/iconography.html      (moved from docs/)
styles/shape-radius.html     (NEW — replaces stub)
styles/elevation.html        (moved from docs/)
styles/motion.html           (moved from docs/)
styles/tokens.html           (moved from docs/)
```

`docs/typography.html`, `docs/iconography.html`, `docs/elevation.html`,
`docs/motion.html`, `docs/tokens.html` each become a **redirect stub** (meta-refresh
+ `<link rel="canonical">` + a visible fallback link) pointing at the new `styles/`
path. The nav shape is unchanged; only five `ref`s flip from `docs/*` to `styles/*`.

## 5. The two new pages

Both follow the built-page anatomy in §3, link `css/wire.css` once, carry their
page-local demo CSS in an inline `<style>`, and end with `wire-inpagenav` +
`wire-doc-pager`. Grayscale only; every value references a token.

### 5.1 Color & theming (`styles/color-theming.html`)

`doc-section` blocks:
1. **Grayscale ramp** — all 13 steps as labelled swatches + a `wire-table` listing
   token name, value, and typical role. The system's hierarchy primitive.
2. **Semantic tokens** — bg / text / border / accent / focus / overlay groups as a
   live swatch set + alias table (semantic token → ramp step → purpose). Shows the
   alias indirection that makes theming possible.
3. **Light / dark theming model** — how `data-theme` on `<html>` drives the
   `[data-theme="dark"]` overrides, the pre-paint inline script that prevents FOUC,
   and the rail theme toggle. A live light/dark comparison of the semantic swatches.
4. **Hierarchy without hue** — the grayscale-only philosophy: hierarchy comes from
   weight, scale, and space, never color. When this is a constraint vs a feature.
5. **Per-client theming (the extension lane)** — brief, abstract description of the
   token-overlay lane (`css/client-overlay.example.css`): a client re-aliases
   *semantic* tokens only, never raw values or component selectors. No client named.

Evidence: WCAG 2.2 §1.4.11 (non-text contrast) and §2.4.7 (focus visible) at
`standard` tier; the grayscale-for-hierarchy stance at `convention`/`judgment` tier,
labelled honestly. Cite existing `citations.json` ids only.

### 5.2 Shape & radius (`styles/shape-radius.html`)

`doc-section` blocks:
1. **Radius scale** — `--radius-xs`…`--radius-2xl` + `--radius-pill` as swatch demos
   (boxes showing each corner radius) + a `wire-table` (token, value, typical use).
2. **Border weights** — the `--border-*` weights demoed on surfaces + table.
3. **Applying shape** — usage guidance: which radius for cards vs inputs vs pills vs
   modals/sheets, and how radius reads at different element sizes.
4. **Rationale** — the "generous on purpose" character of the scale, at
   `convention`/`judgment` tier.

## 6. Audit / normalize the five built pages

Fix divergences only — not a rewrite. For each of Typography, Iconography, Elevation,
Motion, Tokens:
- **Breadcrumb** resolves to the Styles landing (`styles/`), not Foundations/Docs.
- **Eyebrow** in `wire-doc-header` reads "Styles".
- **Pager** (`wire-doc-pager`) prev/next chains through the section order:
  Color & theming → Typography → Iconography → Shape & radius → Elevation → Motion → Tokens.
- **Relative asset paths** (`../css/wire.css`, `../js/wire.js`, images) remain correct
  after the move (depth is unchanged: `docs/x.html` → `styles/x.html`, both one level
  deep — so `../` prefixes are already right).
- **Landing cards** in `styles/index.html` re-pointed to `styles/*`, and the two
  "Planned" status pills removed once the new pages land.

## 7. Relocation mechanics

1. `git mv docs/<page>.html styles/<page>.html` for the five pages.
2. In `manifest.json`, flip the five `ref`s from `docs/*` to `styles/*`; remove the
   two `"status": "planned"` flags.
3. Run `node scripts/build-ia.mjs` — regenerates `partials/nav.html` and re-injects
   the nav/footer/shell into every doc-chrome page (this fixes the ~164 nav links
   automatically and will no longer stub the two now-real pages).
4. Fix non-nav content links by search: `styles/index.html` cards, `directory.html`,
   `get-started.html`, `index.html`, any sitemap/search page, in-body
   cross-references among content pages (e.g. a Tokens "see Elevation" link), and
   **other `manifest.json` references** beyond the nav (e.g. the component
   `reference`/`rationale` pointer at `docs/tokens.html`, manifest line ~123).
5. Write redirect stubs at the five old `docs/*` paths.

## 8. Redirect stub

Each old `docs/<page>.html` becomes a minimal standalone HTML doc: `<meta
http-equiv="refresh" content="0; url=../styles/<page>.html">`, a
`<link rel="canonical" href="…/styles/<page>.html">`, and a visible
"This page has moved — continue to <page>" link as the no-JS / no-refresh fallback.
No nav, no shell. Rationale: the site is deployed (GitHub Pages + Vercel); external
bookmarks and any missed cross-link should not 404. Low cost, high safety.

## 9. Validation (run before handing back)

- **Links:** grep for residual `docs/{typography,iconography,elevation,motion,tokens}.html`
  references outside the redirect stubs themselves → expect only the stubs. Run the
  repo's link/IA check; zero broken links.
- **a11y:** `pa11y` AA on the two new pages + the five moved pages (add to
  `.pa11yci.json` URL list if not auto-discovered). Visible focus, ≥44px targets,
  labels, contrast, reduced-motion.
- **Visual:** light / dark / mobile spot-check of the two new pages and the landing.
- **System fidelity:** validation checklist from `CLAUDE.md` — no hardcoded values,
  no color, no invented classes/tokens, doc-chrome only on doc pages.
- **Evidence:** every cited id exists in `citations.json`; nothing over-tiered; any
  draft marked `UNVERIFIED`.

## 10. File-change inventory

- **New:** `styles/color-theming.html`, `styles/shape-radius.html` (replace stubs).
- **Moved:** five `docs/*.html` → `styles/*.html`.
- **New (redirect stubs):** five `docs/*.html`.
- **Edited:** `manifest.json` (five nav refs + two status flags + any non-nav
  `reference`/`rationale` pointers to the moved pages); `styles/index.html`
  (card refs, pills); `partials/nav.html` + ~164 pages (regenerated, not hand-edited);
  non-nav link fixes in `directory.html`, `get-started.html`, `index.html`, sitemap/search,
  and any cross-refs; `.pa11yci.json` (URLs); `CHANGELOG.md`.

## 11. Risks / open questions

- **Cross-links we don't anticipate.** Mitigated by the redirect stubs — even a missed
  reference resolves. The grep in §9 catches the rest.
- **Pager chain correctness.** The seven-page order in §6 is the canonical sequence;
  the audit enforces it both directions.
- **Demo CSS scope.** New pages add page-local `<style>` (like `.el-swatch`). Acceptable
  for doc-chrome; must not leak generic class names that collide with `wire-`/`u-`.
- **Open:** none blocking. If `pa11y` URL discovery is manual, the new/moved URLs are
  added to `.pa11yci.json` in step §9.
