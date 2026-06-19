# Component page anatomy

The canonical, verified scaffold is **`components/search/index.html`** — clone its
structure for any new component page. Don't reconstruct from memory; copy the real
markup and swap the content. This file documents the parts so you know what to fill.

## File location

A component page lives at the `ref` recorded in `manifest.json` for that component:
- New (grouped) components: `components/<category-folder>/<slug>/index.html`
  (e.g. `components/forms-inputs/select/index.html`). The stub already exists there.
- Existing (flat) components keep their current path (e.g. `components/buttons/`)
  until the phase-2 folder migration.

You are replacing the stub's `<main>` with the full page. Leave the
`<!-- NAV:START -->…<!-- NAV:END -->` and `<!-- FOOTER:START -->…<!-- FOOTER:END -->`
regions alone — `scripts/build-ia.mjs` owns them.

## Page skeleton (inside `<main id="main">`)

```
<section class="u-section"><div class="u-container u-container--wide">
  <nav class="wire-breadcrumb">…  Components / <Category> / <Label></nav>
  <header class="wire-doc-header">
    <div class="wire-doc-header__row">
      <h1 class="wire-doc-header__title"><Label></h1>
      <span class="wire-doc-header__status"><span class="wire-status-pill">Beta</span></span>
    </div>
    <p class="wire-doc-header__lead">One-sentence definition (from brief §0).</p>
    <ul class="wire-doc-header__meta"><li>css/components/<file>.css</li><li>Since vX.Y</li></ul>
  </header>

  <div class="wire-tabs wire-tabs--sticky" data-wire-tabs data-wire-tabs-hash>
    <div role="tablist" class="wire-tabs__list" aria-label="<Label> documentation">
      <button role="tab" id="tab-usage" class="wire-tabs__tab" aria-controls="usage" aria-selected="true" tabindex="0">Usage</button>
      <button role="tab" id="tab-specs" … aria-selected="false" tabindex="-1">Specs</button>
      <button role="tab" id="tab-accessibility" … aria-selected="false" tabindex="-1">Accessibility</button>
    </div>
    <!-- one <section role="tabpanel"> per tab; all but the first carry `hidden` -->
  </div>

  <nav class="wire-doc-pager">…prev / next within the category…</nav>
</div></section>
```

Each tabpanel uses the two-column doc layout:
```
<section role="tabpanel" id="usage" aria-labelledby="tab-usage" class="wire-tabs__panel">
  <div class="wire-shell__doc">
    <div> …doc-sections… </div>
    <nav class="wire-inpagenav" data-wire-inpagenav aria-label="On this page">
      <p class="wire-inpagenav__title">On this page</p>
      <ul class="wire-inpagenav__list">…one link per doc-section id…</ul>
    </nav>
  </div>
</section>
```

A doc-section: `<section id="…" class="doc-section"><h2 class="wire-h3">Title</h2>…</section>`
(Every section needs an `id` so the in-page nav scroll-spy can target it.)

## Brief section → page section map

| Research brief section | Tab | doc-section |
| --- | --- | --- |
| §1 When to use / not | Usage | `when` — "When to use" (use a `<ul>`; cross-link siblings with `<a href="../<sib>/">`) |
| §2 Anatomy | Usage | `anatomy` — prose + `doc-spec-table` (Part / Class / Role) |
| §3 Variants, §10 In context | Usage | `in-context` — `doc-example` blocks (label + live markup using real `wire-` classes) |
| §9 Do / Don't | Usage | `do-dont` — `doc-do-dont` with `--do` / `--dont` cells |
| §1 demo | Usage | `live-demo` — a `doc-example` showing the component |
| §4 States | Specs | `states` — `doc-example` showing each state stacked |
| §7 tokens, §2 | Specs | `tokens` — `doc-spec-table` (Property / Token) |
| §13 markup intent | Specs | `snippet` — `<pre class="doc-snippet">` with escaped HTML |
| §7 labeling | Accessibility | `labeling` |
| §5/§7 semantics | Accessibility | `semantics` |
| §6 keyboard | Accessibility | `keyboard` — `doc-spec-table` (Key / Action) |

Adapt to the component — not every section applies to every component. Keep each
tab's in-page nav in sync with the doc-section ids you actually include.

## Class cheatsheet (doc-chrome — only on doc pages, never on client demos)

`wire-doc-header` (`__row` `__title` `__status` `__lead` `__eyebrow` `__meta` `__meta-item`) ·
`wire-status-pill` (+ `--pending` for beta/migrating/planned) ·
`wire-tabs` (`--sticky`, `__list` `__tab` `__panel`, `data-wire-tabs` `data-wire-tabs-hash`) ·
`wire-shell__doc` (two-col: content + `wire-inpagenav`) ·
`doc-section` · `doc-example` (`__label`) · `doc-spec-table` · `doc-do-dont` (`__cell` `__cell--do` `__cell--dont` `__label`) · `doc-snippet` ·
`wire-inpagenav` (`__title` `__list` `__item` `__link`, `data-wire-inpagenav`) ·
`wire-doc-pager` (`__link` `--prev` `--next`, `__direction` `__title`).

Component demos inside `doc-example` use the component's **real** `wire-` classes
(look them up in `manifest.json` → the component's `class`/`variants`/`elements`).

## Hard constraints (from CLAUDE.md / CONTRIBUTING ten rules)

- Grayscale only. No hue. Status via weight/space/icon/position.
- Tokens only. No hex, px, or rgb() in any new CSS. (Pages add no CSS — reuse classes.)
- Only classes that already exist. No invented `wire-*`/`u-*` names.
- No inline `style=` except the sanctioned grid param `style="--grid-min: …"` used on landings (component pages generally need none).
- WCAG 2.2 AA: visible focus, ≥44px targets, labels on inputs, reduced motion.
- Exactly one `<h1>` per page (the doc-header title). Variant headings are `<h2>`/`<h3>`.
- Decorative `wire-media` placeholders carry `aria-hidden="true"`.
- Older-audience affordances stay available where relevant (healthcare).

## Verification gates (run before calling a page done)

```bash
# from preview/
# 1. no raw values in CSS (only relevant if you touched css/)
grep -rE '[0-9]+px|#[0-9a-f]{3,6}|rgb\(' css/components/

# 2. exactly one <h1>
grep -c '<h1' components/<cat>/<slug>/index.html   # expect 1

# 3. no inline styles on the page
grep -c 'style=' components/<cat>/<slug>/index.html # expect 0

# 4. every wire-* class used is defined
# (include _ in the class so BEM __element / --modifier names aren't truncated —
#  the older [a-z0-9-] pattern reports false "undefined" positives)
grep -rohE '\.wire-[a-z][a-z0-9_-]*' css/ | tr -d '.' | sort -u > /tmp/defined.txt
grep -oE 'class="[^"]*"' components/<cat>/<slug>/index.html | tr ' ' '\n' \
  | grep -oE 'wire-[a-z][a-z0-9_-]*' | sort -u > /tmp/used.txt
comm -23 /tmp/used.txt /tmp/defined.txt   # expect empty
```

Then run `node scripts/build-ia.mjs` (syncs nav/footer, refreshes the landing
pill) and verify in the browser with the preview tools: tabs switch and deep-link
via hash, in-page-nav scroll-spy tracks, pager points to the right neighbors, no
console errors, and a dark-mode spot check.
