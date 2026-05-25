# Primacy Wireframe System

A grayscale wireframe and mid-fidelity component system for Primacy client projects.

Built for healthcare and higher-ed engagements where the goal is to get clients reacting to **structure and content**, not color. No build step. No framework. Open `index.html` in a browser, it works.

---

## 5-minute orientation

```
preview/
├── index.html              ← Component showcase. Start here.
├── docs/                   ← Per-component documentation + principles + tokens
├── pages/                  ← SRALab pressure-test mocks (homepage, specialty, research, find-a-doctor)
├── css/
│   ├── primacy.css         ← One stylesheet to link from any page
│   ├── tokens.css          ← The ONLY file with raw values
│   ├── reset.css | base.css | layout.css | utilities.css
│   └── components/         ← One file per component
└── js/
    └── primacy.js          ← Vanilla JS auto-init for tabs, drawer, mega menu, etc.
```

## Build a page in 5 minutes

1. Copy any HTML file in `pages/` as your starting point.
1. Link the stylesheet (one tag, no build):
   ```html
   <link rel="stylesheet" href="css/primacy.css">
   ```
1. Drop in components from the showcase (`index.html`) — they're already wired up.
1. If you need interactivity (tabs, accordion, drawer), add the script:
   ```html
   <script src="js/primacy.js" defer></script>
   ```
1. Open the file in a browser.

That's it. No `npm install`, no dev server.

## What's in v1

- **Tokens** — grayscale ramp, type scale, spacing scale, radii, borders, shadows, motion. All in `css/tokens.css`. Components reference; nothing hardcodes.
- **Components** — buttons, badges, tags, dividers, breadcrumb, pagination, full form set, top nav + mega menu + sidebar + in-page nav + mobile drawer, cards (content/person/resource/stat), heroes (editorial/split/centered/stat), feature grid, two-column, accordion, tabs, callout, quote, timeline, media placeholders, gallery, lists (linked/definition/article), tables (data/comparison), footers (compact/standard/expanded).
- **Page shells** — documented HTML scaffolds for landing, article, listing, and detail pages.
- **SRALab demo** — four representative page templates as the pressure test.

## Naming

- `.p-*` — component class (BEM-ish): `.p-card`, `.p-card__body`, `.p-card--person`, `.p-card.is-linked`.
- `.u-*` — utility or layout primitive: `.u-stack`, `.u-text-muted`.
- `data-p-*` — JS behavior hook: `data-p-tabs`, `data-p-drawer-open`.
- `.is-*` — state (open, current, loading, etc).

Files and class names: lowercase, kebab-case. Always.

## Accessibility commitments (v1)

- WCAG 2.2 AA contrast on every text/background pair.
- Visible focus ring (`:focus-visible`) on every interactive element.
- Touch targets ≥44×44px on buttons, links, and form controls.
- `prefers-reduced-motion: reduce` zeroes all transitions.
- Skip-to-content link in every page shell.
- Component docs spell out ARIA, keyboard, and screen-reader expectations.

## Consumption surfaces

Same artifact, all of these:

| Surface | How |
|---|---|
| Local browse | Open `index.html`. |
| Figma Make | Copy a component's HTML + paste relevant CSS sections. |
| Claude artifacts | Flatten CSS (concatenate files) and paste alongside HTML. |
| Client handoff | Zip the folder. |
| Static review | Host on GitHub Pages / Vercel / S3. |

To flatten the CSS into a single file (optional, e.g. for an artifact):

```bash
cat css/tokens.css css/reset.css css/base.css css/layout.css css/utilities.css css/components/*.css > primacy.bundle.css
```

## Extending for a client

v1 ships no client-overlay system on purpose — the lane is sketched in [`docs/principles.html`](docs/principles.html#extension). When the second client lands, a single file like `css/clients/<client>.css` re-aliases the semantic tokens (e.g., `--color-accent`, `--space-md`) and adds a small set of client-scoped variants. Component selectors stay untouched.

## What this system is not

- Not a Bootstrap clone.
- Not a production design system. Wireframes and mid-fi only.
- Not a place for color. The grayscale is the point.
- Not framework-bound. No React, no Vue, no preprocessor.

## Conventions for contributors

- Every value goes in `tokens.css`. If you find yourself reaching for a number in a component file, stop and add a token instead.
- Every new component gets a doc page in `docs/`: anatomy, when/when-not, variants, accessibility, snippet.
- Run a quick contrast check on any new text/background pair (any combo of `--gray-*`).
- Keep examples honest — wireframes, not marketing pages.

## License & ownership

Internal Primacy tooling. Built for the experience team.
