# HANDOFF — Preview Design System

A self-contained briefing for the next agent. Read this top-to-bottom once; afterward use it as an index. Everything you need to land a useful change is referenced here or in the linked file.

---

## 30-second TLDR

- **What it is**: a grayscale wireframe and mid-fidelity component system. Plain HTML/CSS/vanilla JS, no build step for the runtime. Open `index.html`, it works.
- **Brand**: Preview Design System. Class prefix is `wire-` — deliberate; the brand is what clients see, the prefix names the visual register.
- **Where**: branch `claude/primacy-design-system-YDvsP` on `uxpreview/preview`. Open PR is #2.
- **Version**: v1.10.4. Semver as documented in `docs/principles.html` § 7.
- **Scale**: 30 components, 42 HTML pages (1 system landing + 1 directory + 19 docs + 21 demos), 14 cited external sources.
- **Two demo verticals**: Riverside Medical Center (18 hospital archetypes) and Northgate University (3 higher-ed archetypes).
- **Hard rules**: see `CONTRIBUTING.md` § "The ten rules". Every commit since v1.0 has cleared them.
- **Audit status**: two documented WCAG 2.2 AA passes (v1.1 + v1.2). Live screen-reader, Pa11y, and Lighthouse runs are documented gaps in `docs/validation.html`.

---

## File tree (the orientation map)

```
preview/
├── index.html                          System landing + component showcase
├── directory.html                      Flat index of every page + reference
├── README.md                           5-minute starter for humans
├── CHANGELOG.md                        Version history, newest first
├── CONTRIBUTING.md                     The ten governance rules
├── HANDOFF.md                          This file
├── .pa11yci.json                       Pa11y CI config (opt-in)
├── lighthouserc.json                   Lighthouse CI config (opt-in)
├── package.json                        Dev scripts: serve / a11y / lh / bundle
├── .nojekyll                           GitHub Pages: serve verbatim
├── .gitignore
│
├── css/
│   ├── wire.css                        ENTRY — @imports the rest
│   ├── tokens.css                      THE ONLY file with raw values
│   ├── reset.css                       Includes scroll-padding + heading scroll-margin
│   ├── base.css                        Typography defaults, focus rings, skip link
│   ├── layout.css                      u-container / u-stack / u-cluster / u-grid / u-sidebar / u-section
│   ├── utilities.css                   u-text-* / u-bg-* / u-hidden-* / u-mt-* / u-visually-hidden
│   ├── print.css                       Strip chrome, expand <details>, append link URLs
│   ├── client-overlay.example.css      Per-client token-override template (read but don't ship)
│   └── components/                     30 component partials, one file each
│
├── js/
│   └── wire.js                         Single file. Auto-inits everything via data-wire-*
│
├── docs/                               19 documentation pages (see "Pages roster" below)
└── pages/                              21 demo pages
```

The CSS @import chain order matters: tokens → reset → base → layout → utilities → components → print. Don't reorder.

---

## Architecture in 90 seconds

### Token-first CSS
`css/tokens.css` is the only place raw values live. Every other CSS file references tokens (`var(--space-md)`, `var(--text-md)`, `var(--color-text)`, etc.). Verify with:

```bash
grep -rE '[0-9]+px|#[0-9a-f]{3,6}|rgb\(' css/components/
```

That should return nothing except pre-existing `-1px` hairline overlaps for borders. The only `rgba()` lives in `tokens.css` itself (overlay + overlay-light).

### Naming
- `.wire-*` — component class, BEM-ish (`.wire-card`, `.wire-card__body`, `.wire-card--person`, `.wire-card.is-linked`)
- `.u-*` — utility or layout primitive
- `data-wire-*` — JS behavior hook (read as `dataset.wire*` from JS)
- `.is-*` — state

Files and class names: lowercase, kebab-case. Always.

### JS architecture
`js/wire.js` is a single IIFE. Each behavior has an `init<Name>()` function called from `boot()`. Behaviors are discovered via `data-wire-*` selectors. Public API on `window`:

- `window.wireToast({ title, body, duration })` — fires a toast programmatically

Everything else is declarative — drop the right `data-wire-*` attribute and `boot()` wires it up on `DOMContentLoaded`.

### Z-index scale (in tokens)
- `--z-base: 1`
- `--z-dropdown: 100` — megamenu panel
- `--z-sticky: 200` — topnav + help-bar fixed
- `--z-overlay: 300` — drawer backdrop
- `--z-modal: 400` — drawer + modal
- `--z-toast: 500` — toast region (top of everything)

### Breakpoints
Mobile-first. Media queries `(min-width: 30em / 48em / 64em / 80em)` are documented in `tokens.css` as constants. Most demo grids and components flip at 48em.

---

## Pages roster

### System core (4)
- `index.html` — landing + full component showcase + hospital pressure-test row
- `directory.html` — flat index of every page + every external reference
- `docs/principles.html` — seven principles incl. semver policy
- `docs/research.html` — evidence basis with citations + WCAG compliance map + audit history + component basis table

### Foundations docs (4)
- `docs/tokens.html` — every token visualized
- `docs/typography.html` — display, h1–h6, lead, body, drop cap
- `docs/utilities.html` — layout primitives + text helpers
- `docs/page-shells.html` — landing/article/listing/detail scaffolds

### Component docs (10)
- `docs/buttons.html`, `cards.html`, `forms.html`, `navigation.html`, `heroes.html`, `content-blocks.html`, `media.html`, `lists.html`, `tables.html`, `footers.html`
- `docs/feedback.html` — modal, toast, banner, empty, skeleton, stepper, tooltip (v1.4 patterns) on one page

### Meta docs (3)
- `docs/validation.html` — testing protocol, browser/device matrices, perf budgets
- `docs/component-status.html` — every component tagged stable/beta/alpha/deprecated
- (`docs/research.html` doubles as a meta doc)

### Hospital demos (18) — Riverside Medical Center
1. `hospital-homepage.html` — editorial hero + conditions grid + featured research
2. `hospital-specialty.html` — Spinal Cord Injury condition page; uses local nav + in-page TOC
3. `hospital-research.html` — labs grid + section tree + timeline
4. `hospital-find-a-doctor.html` — filterable provider listing
5. `hospital-provider.html` — Dr. Maya Okonkwo profile w/ tabs + stats + publications
6. `hospital-patient-visitor.html` — planning your visit; help-bar + text-size widget + FAQ accordion
7. `hospital-location.html` — Riverside Streeterville detail
8. `hospital-patient-story.html` — editorial typography w/ drop cap and pull quotes
9. `hospital-measure.html` — Berg Balance Scale; dense structured-data archetype + citation list
10. `hospital-appointment.html` — confirmation flow; exercises banner/stepper/tooltip/modal/toast/skeleton/empty
11. `hospital-booking.html` — pick-a-time step; calendar grid + slot grid
12. `hospital-search.html` — filter sidebar + active-filter chips + mark-highlighted results
13. `hospital-login.html` — patient portal sign-in
14. `hospital-settings.html` — portal preferences; secondary-nav heavy
15. `hospital-404.html` — error archetype
16. `hospital-portal.html` — logged-in dashboard
17. `hospital-medication.html` — Baclofen detail; safety banner + severity tiers
18. `hospital-trial.html` — Phase 2 trial w/ interactive eligibility checker

### Higher-ed demos (3) — Northgate University
1. `university-homepage.html` — multi-audience tag bar + schools grid
2. `university-program.html` — Cognitive Science BA; long-form detail
3. `university-faculty.html` — filterable directory mirroring find-a-doctor

---

## Components inventory

All under `wire-` prefix, all tokens-only, all WCAG 2.2 AA. Full table with stable/beta tags lives in `docs/component-status.html`. Summary:

| Group | Components |
|---|---|
| Primitives | `wire-button` · `wire-badge` · `wire-tag` (+ `--sm`) · `wire-divider` · `wire-breadcrumb` · `wire-pagination` |
| Forms | `wire-field` (+ `__label` / `__hint` / `__error`) · `wire-input` · `wire-textarea` · `wire-select` · `wire-checkbox` (+ `__input`) · `wire-radio` (+ `__input`) · `wire-toggle` (+ `__input`) |
| Navigation | `wire-topnav` · `wire-megamenu` · `wire-sidenav` (+ v1.3 `__sublist`, `__link--parent` for local/section/tree compositions) · `wire-inpagenav` (scroll-spy) · `wire-drawer` (focus trap) |
| Layout & content | `wire-card` (content/person/resource/stat) · `wire-hero` (editorial/split/centered/stat/inverse) · `wire-feature-grid` · `wire-twocol` · `wire-accordion` (native `<details>`) · `wire-tabs` (ARIA APG) · `wire-callout` · `wire-quote` · `wire-timeline` |
| Media & lists | `wire-media` (ratio labels) · `wire-gallery` (grid/mosaic) · `wire-linked-list` · `wire-deflist` · `wire-article-list` · `wire-citation-list` · `wire-table` (striped) |
| Feedback (v1.4) | `wire-modal` · `wire-toast` · `wire-banner` · `wire-empty` · `wire-skeleton` · `wire-stepper` · `[data-wire-tooltip]` |
| Healthcare | `wire-help-bar` (+ `--fixed`) · `wire-phone-link` · `wire-text-size` |
| Footer | `wire-footer` (compact/standard/expanded/inverse) |

Note the structural patterns that have bitten:
- `wire-field` wraps a label + input + hint. The label class is `wire-field__label`, NOT `wire-label`. The hint is `wire-field__hint`, NOT `wire-help`.
- Checkboxes / radios / toggles use a **label-wrapped** pattern: `<label class="wire-checkbox"><input class="wire-checkbox__input" type="checkbox"><span>Text</span></label>`. Don't wrap the input in a `wire-field` div — that pattern was used by mistake in v1.5 drafts and had to be unwound.
- The visible label text inside checkbox/radio/toggle is a plain `<span>`, not a labeled span.

When in doubt, look at `docs/forms.html` for canonical anatomy.

---

## The ten governance rules (full text in `CONTRIBUTING.md`)

Non-negotiable for any new component, page, or pattern:

1. **Tokens only.** No raw values in component or page CSS.
2. **One docs page** per component family.
3. **One demo usage** in `pages/`.
4. **One citation** (Evidence or Convention) in `docs/research.html` § Component basis.
5. **Mobile-first CSS.** Defaults work at 320px.
6. **WCAG 2.2 AA.** Focus visible, ≥ 24px targets, proper ARIA, keyboard support.
7. **Reduced motion** via `--duration-*` tokens (root rule zeros them out).
8. **Print** — every new page archetype prints sensibly. `print.css` force-expands `<details>`.
9. **Directory in sync.** Update `directory.html` page count + entry when adding pages.
10. **No `data-p-*` regressions.** JS reads `dataset.wire*`. HTML attributes use `data-wire-*`.

Verification commands for rules 1, 9, 10 are at the end of this doc.

---

## State of play & what's loose

### Solid
- All foundations (tokens, layout primitives, utilities, print)
- Components stable per `docs/component-status.html`
- Two documented WCAG audit passes (v1.1, v1.2)
- Sticky topnav with safe-area insets (v1.9)
- Brand identity (v1.10): "Preview Design System" wordmark + folded-corner SVG mark
- Mobile drawer focus trap, scroll-padding, anchor-jump clearance

### Documented gaps (in `docs/validation.html`, called out honestly)
- **Live screen-reader audit** — protocol shipped, log empty until someone runs NVDA + VoiceOver
- **First Pa11y CI run** — config ships in `.pa11yci.json`; baseline not captured yet
- **First Lighthouse CI run** — config ships in `lighthouserc.json`; baseline not captured yet
- **Visual regression baselines** — Playwright protocol documented; baselines not captured
- 11 components in beta status pending the SR audit

### What's not on the roadmap
- v2.0 (would happen only if the `wire-` prefix gets renamed — would be breaking)
- `@media (hover: hover)` gating on `:hover` rules (acknowledged in v1.9 changelog as deferred)
- Hide-on-scroll-down topnav behavior (deliberate: plain sticky is the modern default)

---

## Gotchas — lessons baked in from prior commits

These are the bugs and traps that have actually happened. Reference if a similar change comes up.

### G1 — Silent `dataset.p*` regression after a class rename (v1.2 fix)
When the system rebranded from "Primacy" (`p-`) to "Wire" (`wire-`), the HTML attributes were renamed to `data-wire-*` but three `dataset.p*` reads in `js/wire.js` were missed. Two features (accordion single-mode and text-size widget) were silently broken for an entire version.

**Lesson**: any time you rename an HTML attribute, also `grep -rn "dataset\.p" js/` (or whatever the old prefix was). Don't trust an HTML-only sweep.

### G2 — Form API drift in v1.5
Several pages were drafted with invented class names (`wire-label`, `wire-field--inline`, `wire-input--lg`). The actual API is `wire-field__label`, the label-wrapped checkbox pattern, and a single `wire-input` size. Drafts had to be unwound. **Read `docs/forms.html` before authoring any form.**

### G3 — Brand vs prefix decoupling (v1.10)
"Preview Design System" is the brand. `wire-` is the class prefix. They're decoupled on purpose: the brand can change without forcing every consumer to edit their markup. Renaming `wire-` would be a v2.0 breaking change. Don't conflate the two.

### G4 — Hospital "R" and University "N" letter marks aren't Preview
The hospital pages (`pages/hospital-*.html`) and university pages (`pages/university-*.html`) use letter-form brand marks for their placeholder organizations. Those represent _client brands_, not the Preview brand. When you sweep the Preview logo across the system, DO NOT touch those — the `wire-topnav__brand-mark--logo` modifier on the Preview pages is the discriminator.

### G5 — Decorative `wire-media` placeholders need `aria-hidden="true"`
v1.2 swept 103 `wire-media` divs to add this. Any new decorative `wire-media` needs it too. Verify with the audit grep below.

### G6 — One `<h1>` per page
v1.2 collapsed multi-h1 doc pages (heroes, typography, index) by demoting variant examples to `<h2>`. The typography type-scale demo uses `<p class="wire-h1">` etc. so the visual stays without polluting the heading outline. New docs pages must keep this rule.

### G7 — Sticky topnav + scroll-padding are paired
v1.9 made the topnav sticky and added `scroll-padding-block-start` on `html`. If you remove or restructure either, you'll break anchor-jump targets landing under the chrome. They go together.

### G8 — Megamenu trigger is `<a href>` not `<button>`
Documented in `docs/research.html`. Deliberate trade-off — preserves no-JS fallback navigation. ARIA APG prefers `<button>`; we accept the compromise and document it. Don't "fix" it without re-reading the rationale.

### G9 — Helpers that look hardcoded but aren't
- `tokens.css` has hardcoded color values — that's the entire job of tokens.
- `base.css` has `0.18em`, `0.92em`, `0.85em` for relative micro-adjustments inside `<code>` / `<kbd>` — intentional, relative-to-inherited-font-size.
- `nav.css` has `margin-inline-start: -1px` for hairline border overlap — intentional.

These will trip the "no raw values" grep. Treat them as known-good.

### G10 — The Preview logo lives in 21 files
Each of `index.html`, `directory.html`, and 19 `docs/*.html` files has the inline SVG. There's no shared partial. When iterating the logo, use a Python find-and-replace targeting the exact SVG markup. The HOSPITAL and UNIVERSITY brand-marks (letters) live separately and shouldn't be touched in the same sweep.

---

## Tooling

`package.json` ships dev-only scripts. Nothing runtime depends on `npm`. Setup once:

```bash
npm install
```

Then any of:

| Script | What it does |
|---|---|
| `npm run serve` | Static file server on `http://localhost:8080` |
| `npm run a11y` | Pa11y CI across 40 URLs at localhost:8080; WCAG2AA standard |
| `npm run lh` | Lighthouse CI across 21 URLs; a11y ≥ 95 + best-practices ≥ 90 as errors |
| `npm run visual` | Playwright snapshot tests (baseline not captured yet) |
| `npm run validate` | `a11y && lh` chained |
| `npm run bundle` | Concatenates CSS into `dist/wire.bundle.css` (~110KB) |

`dist/` is gitignored. Don't commit the bundle.

---

## How to do common tasks

### Add a new component
1. Create `css/components/<component>.css`. Reference tokens only.
2. Add `@import url("components/<component>.css");` to `css/wire.css` in alphabetical position within its block.
3. If interactive, add an `init<Name>()` function in `js/wire.js` and call from `boot()`. Use `data-wire-<name>` as the discovery selector. Document dataset reads in the function header.
4. Create `docs/<component>.html` (or extend an existing related docs page) with: anatomy, when/when-not, variants (live examples), accessibility notes, code snippet.
5. Use the component in at least one `pages/*.html`.
6. Add a row to the Component basis table in `docs/research.html` § Component basis with Evidence or Convention tag + a source link.
7. Add a row to `docs/component-status.html` in the appropriate sub-table.
8. Update `directory.html` if it's a new docs page.
9. Update `CHANGELOG.md` with the version block.
10. Run the verification gates (below).

### Add a new page
1. Pick the closest existing archetype in `pages/`. Copy it as the starting point.
2. Strip / adapt content; reuse components only — no new CSS.
3. Update `directory.html` (page count + entry).
4. If it's a new archetype, add it to `docs/validation.html` § print testing matrix.
5. Verify.

### Fix a bug
1. Reproduce. Don't speculate.
2. If the bug is regression-shaped (worked before, broken now), check `CHANGELOG.md` for what changed recently.
3. If it's a11y, check `docs/research.html` § Audit history first — there may be a documented decision.
4. Fix in the smallest possible scope. No drive-by refactors.
5. Add to `CHANGELOG.md` under the next patch version.

### Iterate on the Preview logo
The SVG lives inline in 21 files. To swap:

```bash
NEW_SVG='<new svg string>'
OLD_SVG='<current svg from any file>'
FILES=$(grep -rl 'wire-topnav__brand-mark--logo' --include="*.html" .)
for f in $FILES; do
  python3 -c "
import sys
path, old, new = sys.argv[1], sys.argv[2], sys.argv[3]
text = open(path).read().replace(old, new)
open(path, 'w').write(text)
" "$f" "$OLD_SVG" "$NEW_SVG"
done
```

Don't touch the hospital `R` or university `N` letter marks.

### Rebrand for a new client
Use `css/client-overlay.example.css` as the template. Token re-aliases only. Load after `wire.css`. Component selectors stay untouched. See README § Extending for a client.

---

## Verification gates (paste these before committing)

```bash
# 1. Token discipline — no raw values in components
grep -rE '[0-9]+px|#[0-9a-f]{3,6}|rgb\(' css/components/

# 2. No data-p-* regressions
grep -rn 'dataset\.p\b' js/
grep -rn 'data-p-' --include="*.html" .

# 3. One <h1> per page
for f in index.html directory.html docs/*.html pages/*.html; do
  c=$(grep -c '<h1' "$f")
  [ "$c" -ne 1 ] && echo "$f: $c h1s (FAIL)"
done

# 4. wire-media aria-hidden coverage
total=$(grep -rhE '<div class="wire-media[^"]*"' --include="*.html" . | wc -l)
hidden=$(grep -rhE '<div class="wire-media[^"]*"[^>]*aria-hidden="true"' --include="*.html" . | wc -l)
echo "wire-media: $hidden of $total carry aria-hidden"

# 5. Class resolution — no undefined wire-* classes on a given page
grep -rohE '\.wire-[a-z][a-z0-9-]*' css/ | tr -d '.' | sort -u > /tmp/defined.txt
PAGE=path/to/page.html
grep -oE 'class="[^"]*"' "$PAGE" | tr ' ' '\n' | grep -oE '"?wire-[a-z][a-z0-9-]*' | tr -d '"' | sort -u > /tmp/used.txt
comm -23 /tmp/used.txt /tmp/defined.txt  # should be empty

# 6. Branding consistency
grep -rh "Wireframe Design System" --include="*.html" --include="*.md" .  # should be 0 except CHANGELOG history
grep -rln 'wire-topnav__brand-mark">P' --include="*.html" .  # should be 0 (Preview pages use SVG now)
```

---

## Quick reference

### Git
- Branch: `claude/primacy-design-system-YDvsP`
- Remote: `origin` → `uxpreview/preview` on GitHub
- PR: #2 (title is editable via the GitHub MCP)
- Push: `git push -u origin claude/primacy-design-system-YDvsP`

### Where things live
| Asking | Look in |
|---|---|
| What does this component do | `docs/<component>.html` |
| What's the API for forms | `docs/forms.html` |
| Why is X done this way | `docs/research.html` § Component basis |
| What WCAG criterion does Y satisfy | `docs/research.html` § WCAG map |
| What's the testing protocol | `docs/validation.html` |
| Is X stable | `docs/component-status.html` |
| When did Y ship | `CHANGELOG.md` |
| How do I add a component | `CONTRIBUTING.md` § add a new component |
| What's the philosophy | `docs/principles.html` |
| What pages exist | `directory.html` |

### File patterns to mirror
- Demo page: any `pages/hospital-*.html`
- Docs page: any `docs/*.html` except the meta ones (research/validation/component-status which have their own shape)
- Component CSS: any `css/components/*.css` — header comment explains anatomy + variants + behavior
- New behavior in JS: read `initDrawer`, `initModal`, `initToast` as templates (they share the focus-trap pattern)

### Tokens cheat sheet
- Space: `--space-3xs` (2px) → `--space-5xl` (128px)
- Type: `--text-2xs` (12px) → `--text-6xl` (88px)
- Radius: `--radius-xs` (4px) → `--radius-2xl` (32px) + `--radius-pill`
- Color: `--color-bg`, `--color-bg-subtle`, `--color-bg-muted`, `--color-bg-inverse`, `--color-text`, `--color-text-muted`, `--color-text-subtle`, `--color-text-inverse`, `--color-border`, `--color-border-strong`, `--color-accent`, `--color-focus`, `--color-overlay`, `--color-overlay-light`
- Grayscale ramp: `--gray-00` (white) → `--gray-100` (black) in 13 steps
- Motion: `--duration-fast/base/slow` (zeroed by `prefers-reduced-motion: reduce`)

### Voice
The system speaks plainly. Honest about gaps. No marketing hype. Citations or "convention" tags on every meaningful decision. Read the existing `docs/research.html` and CHANGELOG copy for tone.

---

## Recently shipped (last five commits worth knowing)

- **v1.10.4** — Logo simplified to a single-path folded-document silhouette; "Preview Design System" wordmark hidden on mobile (`u-hidden-mobile`); `aria-label` added to brand link so screen readers still get the name.
- **v1.10.3** — Earlier logo iteration (stacked rectangles); superseded.
- **v1.10.2** — First SVG logo attempt (viewport + lines); superseded.
- **v1.10.1** — Brand consistency polish: doc footer taglines normalized, directory count fixed, `package.json` "name" renamed to `preview-design-system`.
- **v1.10.0** — Brand rename "Wireframe Design System" → "Preview Design System" across 72 occurrences. `wire-` prefix kept (decoupled brand vs prefix).
- **v1.9** — Sticky topnav (always); mobile height tightened to 3.5rem; `scroll-padding-block-start` on `html`; safe-area insets on topnav / drawer / help-bar / toast.

The README has the long form. `CHANGELOG.md` has the full history.

---

## Open questions you may inherit

These aren't bugs but might come up:

- **Should the topnav use `@media (hover: hover)` to suppress sticky-hover on touch devices?** Acknowledged as v1.9 follow-up. Larger refactor; deferred.
- **Should Pa11y / Lighthouse run in CI on every push?** Configs ship but the first run is pending a stable host (Pages or Vercel).
- **Should we capture Playwright visual baselines now or wait for v2.0?** Protocol documented in `docs/validation.html`; baselines uncaptured.
- **Will the `wire-` prefix ever be renamed?** Only with a v2.0 (breaking). Not on the roadmap.
- **Should `<details>` accordions auto-expand when an in-page anchor jumps to a heading inside them?** Not currently — anchor jumps land on the heading but the wrapping `<details>` doesn't open. Could be a small JS addition. Not requested yet.

---

## When in doubt

1. Mirror the closest existing pattern. Don't invent.
2. Read the changelog before "fixing" something — it might be a deliberate decision (G8, G9).
3. Run the verification gates before committing.
4. If you break a rule, document the rationale in the commit message AND in the changelog entry.
5. Keep the brand honest — Evidence vs Convention is a contract.
