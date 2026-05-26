# Preview Design System

A grayscale wireframe and mid-fidelity component system. No build step, no framework, no third-party CSS. Open `index.html` in a browser and it works.

Built for healthcare and higher-ed engagements where the goal is to get clients reacting to **structure and content**, not color. Same artifact ships to every consumption surface — local browse, Figma Make, Claude artifacts, client handoff, static review on Pages or Vercel.

---

## 5-minute orientation

```
preview/
├── index.html                    Component showcase. Start here.
├── directory.html                Flat index of every page + external reference.
├── README.md                     This file.
├── CHANGELOG.md                  Version history v1.0 → current, newest first.
├── CONTRIBUTING.md               The ten governance rules every change follows.
├── .pa11yci.json                 Pa11y CI config (opt-in).
├── lighthouserc.json             Lighthouse CI config (opt-in).
├── package.json                  Dev-only scripts: serve / a11y / lh / bundle.
│
├── css/
│   ├── wire.css                  Entry — @imports the rest. Link this once.
│   ├── tokens.css                The ONLY file with raw values.
│   ├── reset.css | base.css | layout.css | utilities.css | print.css
│   ├── client-overlay.example.css  Template for per-client token override.
│   └── components/               30 component partials, one file each.
│
├── js/
│   └── wire.js                   Vanilla JS auto-init for every behavior.
│
├── docs/                         18 documentation pages: principles, tokens,
│                                 per-component, feedback patterns, research,
│                                 validation, component status.
└── pages/                        21 demo pages: 18 Riverside (hospital) + 3
                                  Northgate (higher-ed) demos.
```

## Build a page in 5 minutes

1. Copy any HTML file in `pages/` as your starting point. The closest archetype is usually obvious — a long-form page is `hospital-patient-visitor.html`, a detail with structured data is `hospital-measure.html`, a listing is `hospital-find-a-doctor.html`, a dashboard is `hospital-portal.html`.
2. Link the stylesheet (one tag, no build):
   ```html
   <link rel="stylesheet" href="css/wire.css">
   ```
3. Drop in components from the showcase at `index.html` — they're already wired up. Markup conventions live in each `docs/<component>.html`.
4. If your page uses anything interactive (tabs, accordion, drawer, modal, toast, in-page nav, text-size widget), add the script:
   ```html
   <script src="js/wire.js" defer></script>
   ```
5. Open the file in a browser.

That's it. No `npm install`, no dev server.

## What's in v1.10

**Foundations** — token layer (`css/tokens.css`): grayscale ramp, type scale, spacing scale, radii, borders, shadows, motion, z-index, breakpoints. Components reference, nothing hardcodes.

**30 components**, all under the `wire-` prefix, grouped:

- **Primitives** — button, badge, tag, divider, breadcrumb, pagination.
- **Forms** — input, textarea, select, checkbox, radio, toggle, full field shell with label + hint + error.
- **Navigation** — top nav (sticky), mega menu, side nav (with the v1.3 local / secondary / section-tree compositions), in-page nav with scroll-spy, mobile drawer with focus trap.
- **Layout & content** — card (content / person / resource / stat), hero (editorial / split / centered / stat / inverse), feature grid, two-column, accordion (native `<details>`), tabs (ARIA APG with arrow keys), callout, quote, timeline.
- **Media & lists** — media placeholders with ratio labels, gallery (grid / mosaic), linked list, definition list, article/news list, citation list, table (data, comparison, striped).
- **Feedback** — modal, toast, banner, empty state, skeleton, stepper, tooltip.
- **Healthcare-specific** — persistent help bar, phone link, text-size control with localStorage persistence and a polite live region.
- **Footer** — compact, standard, expanded with CTA row, inverse.

**18 documentation pages** under `docs/` — principles, tokens, typography, one page per component family, page shells, plus three meta pages: research, validation, component status.

**21 demo pages** under `pages/`:
- 18 hospital archetypes for **Riverside Medical Center**: homepage, conditions/specialty, research, find-a-doctor, provider profile, planning-your-visit, location detail, patient story, research-measure (Berg Balance Scale), appointment confirmation, appointment booking, search results, sign-in, settings, 404, patient portal dashboard, medication detail, clinical trial.
- 3 higher-ed archetypes for **Northgate University**: homepage, BA-in-Cognitive-Science program detail, faculty directory.

**Validation tooling (opt-in)** — Pa11y CI and Lighthouse CI configs cover every page; `npm run validate` runs both. Visual regression scaffolding via Playwright is documented but not yet wired. See `docs/validation.html` for the matrix.

**Governance** — `CHANGELOG.md` records every release. `CONTRIBUTING.md` documents the ten rules every new component or page follows. `docs/component-status.html` tags every component `stable` / `beta` / `alpha` / `deprecated` with version-since metadata.

## Naming

- `.wire-*` — component class (BEM-ish): `.wire-card`, `.wire-card__body`, `.wire-card--person`, `.wire-card.is-linked`. The `wire-` prefix is deliberate — it names the visual register (wireframe aesthetic) and prevents collisions when embedded in client CMSes.
- `.u-*` — utility or layout primitive: `.u-stack`, `.u-cluster`, `.u-grid`, `.u-text-muted`, `.u-visually-hidden`.
- `data-wire-*` — JS behavior hook: `data-wire-tabs`, `data-wire-drawer-open`, `data-wire-modal-open`, `data-wire-toast-trigger`.
- `.is-*` — state (open, current, loading, complete).

Files and class names: lowercase, kebab-case. Always.

## Accessibility commitments

The system targets **WCAG 2.2 Level AA**, verified through two documented audit passes (v1.1 + v1.2). `docs/research.html` carries the full compliance map; `docs/validation.html` documents the testing protocol and honest gaps.

- Contrast 4.5:1 minimum for body text; 3:1 minimum for UI components (`--color-border-strong` clears both).
- Visible focus ring on every interactive element; inverse contexts override `--color-focus` to white.
- Touch targets ≥ 24px (AA floor) across all controls; primary controls and form inputs clear 44px (Apple HIG / AAA).
- `prefers-reduced-motion: reduce` zeroes all transitions via the `--duration-*` tokens.
- Skip-to-content link in every page; sticky topnav respects `env(safe-area-inset-top)`; anchor jumps respect `scroll-padding-block-start`.
- Mobile drawer and modal implement the ARIA APG dialog pattern: focus trap, Esc to close, focus return to opener.
- Toast and text-size widget announce changes through polite live regions (WCAG 4.1.3).
- Component docs name the ARIA pattern, keyboard contract, and screen-reader expectations for each behavior.

**Honest gaps** (documented in `docs/validation.html`): live screen-reader pass with NVDA + VoiceOver, automated tooling first runs, visual-regression baselines.

## Consumption surfaces

Same artifact, all of these:

| Surface | How |
|---|---|
| Local browse | Open `index.html`. |
| Figma Make | Copy a component's HTML; paste the relevant CSS sections. |
| Claude artifacts | Run `npm run bundle` to get `dist/wire.bundle.css`, paste alongside HTML. |
| Client handoff | Zip the folder. The recipient needs no toolchain. |
| Static review | Push to GitHub Pages (the repo's `.nojekyll` is set), Vercel, or any static host. |

The bundle script (one of several opt-in dev scripts in `package.json`) concatenates the CSS partials into a single ~110 KB file:

```bash
npm run bundle      # writes dist/wire.bundle.css
```

## Extending for a client

The system ships `css/client-overlay.example.css` as a runnable template. Re-defines tokens only — colors, type scale, radii, motion — without touching component selectors. Load it after `wire.css`:

```html
<link rel="stylesheet" href="css/wire.css">
<link rel="stylesheet" href="css/clients/acme-medical.css">
```

Copy the example file, rename per client, edit the values. Component CSS stays untouched, which means every page picks the overlay up for free.

## Validation (opt-in)

Pa11y CI and Lighthouse CI configs ship in the repo root. The scaffolding requires a one-time `npm install`; nothing in the runtime depends on it.

```bash
npm install           # one-time
npm run serve         # http://localhost:8080
npm run a11y          # Pa11y CI — WCAG2AA across every page
npm run lh            # Lighthouse CI — a11y / best-practices / perf / seo
npm run validate      # runs both
```

Budgets, the browser support matrix, the device matrix, the print testing matrix, and the per-page-type performance budgets all live in `docs/validation.html`.

## What this system is not

- Not a Bootstrap clone — utility classes exist for layout primitives only (`u-stack`, `u-cluster`, `u-grid`), not for one-property atomic CSS.
- Not a production design system. The grayscale register reads as wireframe / mid-fi on purpose.
- Not a place for color. The grayscale is the point.
- Not framework-bound. No React, no Vue, no preprocessor, no build step for the runtime.

## Contributing

Read `CONTRIBUTING.md` before adding a component or a page. The ten rules cover token discipline, mobile-first defaults, the WCAG floor, the citation requirement, the directory-in-sync rule, and the regression checks. Every commit since v1.0 has cleared them.

## License & ownership

An unbranded, MIT-style open-source wireframe and mid-fidelity component system. Take it, fork it, theme it.
