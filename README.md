# Wireframe Design System

A grayscale wireframe and mid-fidelity component system for client wireframing.

Built for healthcare and higher-ed engagements where the goal is to get clients reacting to **structure and content**, not color. No build step. No framework. Open `index.html` in a browser, it works.

---

## 5-minute orientation

```
preview/
├── index.html              ← Component showcase. Start here.
├── docs/                   ← Per-component documentation + principles + tokens
├── pages/                  ← Riverside pressure-test mocks (homepage, specialty, research, find-a-doctor)
├── css/
│   ├── wire.css         ← One stylesheet to link from any page
│   ├── tokens.css          ← The ONLY file with raw values
│   ├── reset.css | base.css | layout.css | utilities.css
│   └── components/         ← One file per component
└── js/
    └── wire.js          ← Vanilla JS auto-init for tabs, drawer, mega menu, etc.
```

## Build a page in 5 minutes

1. Copy any HTML file in `pages/` as your starting point.
1. Link the stylesheet (one tag, no build):
   ```html
   <link rel="stylesheet" href="css/wire.css">
   ```
1. Drop in components from the showcase (`index.html`) — they're already wired up.
1. If you need interactivity (tabs, accordion, drawer), add the script:
   ```html
   <script src="js/wire.js" defer></script>
   ```
1. Open the file in a browser.

That's it. No `npm install`, no dev server.

## What's in v1.1

- **Tokens** — grayscale ramp, type scale, spacing scale, radii, borders, shadows, motion. All in `css/tokens.css`. Components reference; nothing hardcodes.
- **Components** — buttons, badges, tags, dividers, breadcrumb, pagination, full form set, top nav + mega menu + sidebar + in-page nav + mobile drawer (with focus trap), cards (content/person/resource/stat), heroes (editorial/split/centered/stat), feature grid, two-column, accordion, tabs, callout, quote, timeline, media placeholders, gallery, lists (linked/definition/article), tables (data/comparison), footers (compact/standard/expanded).
- **Healthcare/higher-ed patterns** — persistent help bar, phone link, text-size control, print stylesheet.
- **Page shells** — documented HTML scaffolds for landing, article, listing, and detail pages.
- **Riverside demo** — four representative page templates as the pressure test.
- **Research foundation** — `docs/research.html` documents the evidence basis for every meaningful decision (WCAG criteria, NN/g articles, Baymard findings) and is honest about what's convention vs. evidence.

## Naming

- `.wire-*` — component class (BEM-ish): `.wire-card`, `.wire-card__body`, `.wire-card--person`, `.wire-card.is-linked`.
- `.u-*` — utility or layout primitive: `.u-stack`, `.u-text-muted`.
- `data-wire-*` — JS behavior hook: `data-wire-tabs`, `data-wire-drawer-open`.
- `.is-*` — state (open, current, loading, etc).

Files and class names: lowercase, kebab-case. Always.

## Accessibility commitments (v1.1)

The system targets **WCAG 2.2 Level AA**. v1.1 documents what's verified, what's authored-against, and what's out of scope. See `docs/research.html` for the full compliance map and audit results.

- Contrast 4.5:1 minimum (1.4.3); UI components 3:1 minimum (1.4.11) — `--color-border-strong` bumped to gray-50 in v1.1 to clear this.
- Visible focus ring on every interactive element (2.4.7); inverse contexts override `--color-focus` to white so the ring stays visible on dark surfaces.
- Touch targets ≥44×44px on primary controls; ≥28px on inline link patterns (footer, breadcrumb, in-page nav) — meets WCAG 2.5.8 AA.
- `prefers-reduced-motion: reduce` zeroes all transitions.
- Skip-to-content link in every page shell.
- Mobile drawer implements modal dialog pattern: `role="dialog"`, `aria-modal`, focus trap, Esc to close.
- `scroll-margin-block-start` on headings keeps anchor jumps unobstructed (2.4.11).
- Component docs spell out ARIA, keyboard, and screen-reader expectations.

Out of scope for v1.1, documented honestly: live screen-reader pass (NVDA/VoiceOver), automated tooling (axe/Pa11y/Lighthouse CI), AAA criteria, Section 508 mapping.

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
cat css/tokens.css css/reset.css css/base.css css/layout.css css/utilities.css css/components/*.css > wire.bundle.css
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

An unbranded wireframe and mid-fidelity component system.
