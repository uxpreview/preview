# Local navigation — page rework + five variants — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. When authoring the two HTML pages, also load the repo's `preview-component-page` skill — it owns the page scaffold + rail/landing wiring.

**Goal:** Rename the Side nav page to "Local navigation," grow it into the local-navigation family hub (decision framework + five variant demos + deep-hierarchy model), and ship the one new atom `wire-subnav` plus a `wire-sidenav --sticky` modifier, all cited.

**Architecture:** Grayscale, tokens-only, plain HTML+CSS, no build step. New CSS lives in `css/components/*.css` imported by `css/wire.css`. The doc-site rail/chrome on every page is generated from `manifest.json` by `scripts/build-ia.mjs` — never hand-edited. Component docs are 3-tab pages (Usage/Specs/Accessibility) using `doc-` helper classes. Evidence is centralized in `citations.json` and referenced by id with an honest tier.

**Tech Stack:** HTML5, CSS (custom properties / logical properties), `scripts/build-ia.mjs` (Node) for nav generation, `pa11y-ci` for AA gates, `serve` for local preview.

**Commit policy:** Per the user's global rule, commits run only on explicit go-ahead. Commit steps below are checkpoints — stage the listed files and request approval before committing; batch if preferred.

---

## File Structure

| File | Create/Modify | Responsibility |
|---|---|---|
| `css/components/subnav.css` | Create | `wire-subnav` horizontal section sub-nav |
| `css/wire.css` | Modify | `@import` subnav.css (alpha order) |
| `css/components/nav.css` | Modify | Add `.wire-sidenav--sticky` |
| `components/subnav/index.html` | Create | `wire-subnav` 3-tab doc page |
| `components/side-nav/index.html` | Modify | Retitle → "Local navigation"; add framework + 5 variants + deep-hierarchy |
| `manifest.json` | Modify | Update `sidenav`; add `subnav`; nav-tree rename + insert |
| `citations.json` | Modify | Fix 1 stale URL; add 5 verified citations |
| `docs/research.html` | Modify | Component-basis row for `subnav` |
| `directory.html` | Modify | Counts + subnav entry |
| `CHANGELOG.md` | Modify | Next-minor entry |
| `pages/hospital-specialty.html` | Modify | One real `wire-subnav` demo use |

Generated/derived (do not hand-edit the NAV block): the `<!-- NAV:START -->…<!-- NAV:END -->` region, footer, and shell body class are emitted by `build-ia.mjs` (Task 8). New pages are authored with the `<main>` content; chrome is scaffolded from a sibling page then synced by the generator.

---

## Task 1: `wire-subnav` CSS

**Files:**
- Create: `css/components/subnav.css`
- Modify: `css/wire.css`

- [ ] **Step 1: Define the acceptance check (class resolution + token purity)**

The component is "done" for this task when every `wire-subnav*` class resolves in `css/` and the file has no raw px/hex.

- [ ] **Step 2: Verify it currently fails (class absent)**

Run: `grep -rn "wire-subnav" "css/" || echo "ABSENT"`
Expected: `ABSENT` (no such class yet).

- [ ] **Step 3: Create `css/components/subnav.css`**

```css
/* ============================================================
   Section sub-nav — a horizontal row of sibling links for one
   level of local navigation, sitting under the global top nav
   (the inverted-L). The compact, content-first counterpart to
   the left rail (wire-sidenav). Static links, no JS.
   ============================================================ */
.wire-subnav {
  border-block-end: var(--border-thin) solid var(--color-border);
}

.wire-subnav__list {
  display: flex;
  align-items: stretch;
  gap: var(--space-2xs);
  padding: 0;
  margin: 0;
  list-style: none;
  /* Scroll, don't wrap, on narrow viewports so the bar stays one row and
     never grows into a tall block that shoves content down. */
  overflow-x: auto;
  overscroll-behavior-x: contain;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}
.wire-subnav__list::-webkit-scrollbar { display: none; }

.wire-subnav__item {
  margin: 0;
  flex: 0 0 auto;
}

.wire-subnav__link {
  display: inline-flex;
  align-items: center;
  min-block-size: 2.75rem; /* WCAG 2.5.8 — ≥44px target */
  padding-inline: var(--space-md);
  padding-block: var(--space-sm);

  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  color: var(--color-text-muted);
  text-decoration: none;
  white-space: nowrap;

  border-block-end: var(--border-md) solid transparent;
}
.wire-subnav__link:hover {
  color: var(--color-text);
  text-decoration: none;
}
.wire-subnav__link.is-current {
  color: var(--color-text);
  font-weight: var(--weight-semibold);
  border-block-end-color: var(--color-accent);
}
```

- [ ] **Step 4: Import it in `css/wire.css`**

Run first to find the slot: `grep -n "components/stepper.css\|components/table.css\|components/status-pill.css" css/wire.css`
Add, in alphabetical position (after `stepper`, before `table`):
```css
@import "components/subnav.css";
```

- [ ] **Step 5: Verify token purity + resolution**

Run: `grep -nE '[0-9]+px|#[0-9a-fA-F]{3,8}\b' css/components/subnav.css || echo "TOKENS-CLEAN"`
Expected: `TOKENS-CLEAN` (rem literals for target sizes are allowed and match `nav.css` precedent; no px/hex).
Run: `grep -c "components/subnav.css" css/wire.css`
Expected: `1`.

- [ ] **Step 6: Commit (checkpoint — see commit policy)**

```bash
git add css/components/subnav.css css/wire.css
git commit -m "feat(subnav): add wire-subnav horizontal section sub-nav CSS"
```

---

## Task 2: `wire-sidenav --sticky` modifier

**Files:**
- Modify: `css/components/nav.css`

- [ ] **Step 1: Verify it currently fails (modifier absent)**

Run: `grep -n "wire-sidenav--sticky" css/components/nav.css || echo "ABSENT"`
Expected: `ABSENT`.

- [ ] **Step 2: Add the modifier after the sidenav block**

Insert immediately after the `.wire-sidenav__sublist .wire-sidenav__link.is-current { … }` rule (just before the `/* ---------- In-page nav … ---------- */` banner):
```css
/* Sticky variant — pins the rail within a scrolling content column on
   tablet+. Released below 48em so a tall rail never traps content on
   phones (the same reflow guard wire-inpagenav uses). */
@media (min-width: 48em) {
  .wire-sidenav--sticky {
    position: sticky;
    inset-block-start: var(--space-lg);
  }
}
```

- [ ] **Step 3: Verify present + token-clean**

Run: `grep -n "wire-sidenav--sticky" css/components/nav.css`
Expected: matches inside the `@media (min-width: 48em)` block.
Run: `grep -nE '#[0-9a-fA-F]{3,8}\b' css/components/nav.css || echo "NO-HEX"`
Expected: `NO-HEX`.

- [ ] **Step 4: Commit (checkpoint)**

```bash
git add css/components/nav.css
git commit -m "feat(sidenav): add --sticky modifier with sub-48em reflow guard"
```

---

## Task 3: Citations

**Files:**
- Modify: `citations.json`

- [ ] **Step 1: Verify the five new ids are absent and locate the array**

Run: `for id in nng-local-navigation nng-you-are-here nng-right-rail-blindness cloudscape-side-navigation uswds-side-navigation; do grep -q "\"$id\"" citations.json && echo "PRESENT $id" || echo "ABSENT $id"; done`
Expected: five `ABSENT` lines.
Run: `grep -n '"id": "nng-left-side-vertical-navigation"' citations.json`
Note the line for Step 2.

- [ ] **Step 2: Correct the stale URL on the reused citation**

In the `nng-left-side-vertical-navigation` object, set:
- `source.url` → `"https://www.nngroup.com/articles/vertical-nav/"`
- `verified_date` → `"2026-06-08"`
- `verification` → `"Re-fetched and read 2026-06-08; URL corrected to current canonical."`

- [ ] **Step 3: Add the five new citation objects to the citations array**

Insert these objects into the same array that holds the `nng-*` entries (keep JSON valid — mind the commas):
```json
{
  "id": "nng-local-navigation",
  "tier": "empirical",
  "finding": "Local navigation is contextual to the user's location: it shows the current node plus its siblings and applicable children, and should be visible but less salient than global nav. Placement is horizontal-below-global or left-vertical (the inverted-L); beyond ~4 tiers, breadcrumbs replace sibling display.",
  "source": { "org": "Nielsen Norman Group", "title": "Local Navigation Is a Valuable Orientation and Wayfinding Aid", "year": null, "url": "https://www.nngroup.com/articles/local-navigation/" },
  "verified_date": "2026-06-08",
  "verification": "Fetched and read 2026-06-08; findings reflected on the Local navigation page.",
  "supports": ["sidenav", "subnav", "navigation"]
},
{
  "id": "nng-you-are-here",
  "tier": "empirical",
  "finding": "Navigation must show where you are, not just where you can go. Indicate current location by highlighting the active item and, in deeper hierarchies, with breadcrumbs; location signals are often too subtle, so test by asking users where they are.",
  "source": { "org": "Nielsen Norman Group", "title": "Navigation: You Are Here", "year": null, "url": "https://www.nngroup.com/articles/navigation-you-are-here/" },
  "verified_date": "2026-06-08",
  "verification": "Fetched and read 2026-06-08.",
  "supports": ["sidenav", "breadcrumb", "navigation"]
},
{
  "id": "nng-right-rail-blindness",
  "tier": "empirical",
  "finding": "Reserve the right rail for secondary, contextual content (related links, an in-page table of contents). Banner/right-rail blindness means primary navigation placed there is widely ignored.",
  "source": { "org": "Nielsen Norman Group", "title": "Fight Against Right-Rail Blindness", "year": null, "url": "https://www.nngroup.com/articles/fight-right-rail-blindness/" },
  "verified_date": "2026-06-08",
  "verification": "Fetched and read 2026-06-08.",
  "supports": ["inpagenav", "navigation"]
},
{
  "id": "cloudscape-side-navigation",
  "tier": "convention",
  "finding": "Keep side navigation shallow (about three levels); always keep exactly one link active; for deeper hierarchies, surface lower levels via links within parent pages rather than deepening the rail.",
  "source": { "org": "AWS Cloudscape Design System", "title": "Side navigation pattern", "year": null, "url": "https://cloudscape.design/patterns/general/service-navigation/side-navigation/" },
  "verified_date": "2026-06-08",
  "verification": "Fetched and read 2026-06-08.",
  "supports": ["sidenav", "navigation"]
},
{
  "id": "uswds-side-navigation",
  "tier": "convention",
  "finding": "Side navigation suits one-to-three levels of hierarchy; nested lists express parent/child/grandchild; the current page is marked with a current class and aria-current; siblings render as same-level items.",
  "source": { "org": "U.S. Web Design System (USWDS)", "title": "Side navigation", "year": null, "url": "https://designsystem.digital.gov/components/side-navigation/" },
  "verified_date": "2026-06-08",
  "verification": "Fetched and read 2026-06-08.",
  "supports": ["sidenav", "subnav", "navigation"]
}
```

- [ ] **Step 4: Validate JSON**

Run: `node -e "JSON.parse(require('fs').readFileSync('citations.json','utf8')); console.log('JSON OK')"`
Expected: `JSON OK`.
Run: `for id in nng-local-navigation nng-you-are-here nng-right-rail-blindness cloudscape-side-navigation uswds-side-navigation; do grep -q "\"$id\"" citations.json && echo "PRESENT $id"; done`
Expected: five `PRESENT` lines.

- [ ] **Step 5: Commit (checkpoint)**

```bash
git add citations.json
git commit -m "docs(citations): add 5 local-nav sources (verified 2026-06-08); fix stale NN/g URL"
```

---

## Task 4: Manifest — `sidenav` update, `subnav` entry, nav tree

**Files:**
- Modify: `manifest.json`

- [ ] **Step 1: Update the `sidenav` component entry**

Locate `"id": "sidenav"` (around line 1645). Apply:
- `status`: `"stable (sublist/parent compositions: beta)"` → `"stable"`
- Add a `modifiers` array: `"modifiers": ["wire-sidenav--sticky"]`
- Replace the `rationale` array with:
```json
"rationale": [
  { "decision": "Left-rail vertical nav for deep IAs", "citation_ids": ["nng-left-side-vertical-navigation", "ibm-carbon-side-nav", "nng-local-navigation"] },
  { "decision": "Scope the rail to the nearest branch + breadcrumb for deep hierarchy; keep one active item", "citation_ids": ["cloudscape-side-navigation", "nng-you-are-here"] },
  { "decision": "aria-current=page on the active item", "citation_ids": ["wcag-4.1.2-name-role-value"] }
]
```

- [ ] **Step 2: Add the `subnav` component entry**

Add this object to the `components` array (place it adjacent to other navigation entries):
```json
{
  "id": "subnav",
  "level": "molecule",
  "category": "navigation",
  "class": "wire-subnav",
  "file": "css/components/subnav.css",
  "ref": "components/subnav/",
  "status": "stable",
  "desc": "A horizontal row of sibling links for one level of local navigation, under the global top nav (the inverted-L).",
  "elements": ["wire-subnav__list", "wire-subnav__item", "wire-subnav__link"],
  "states": ["is-current"],
  "rationale": [
    { "decision": "Horizontal section nav for shallow, content-first IAs", "citation_ids": ["nng-local-navigation", "uswds-side-navigation"] },
    { "decision": "aria-current=page on the active item", "citation_ids": ["wcag-4.1.2-name-role-value"] }
  ]
}
```

- [ ] **Step 3: Update the nav tree (navigation group)**

Locate the navigation group leaves (around lines 4805-4839):
- Rename the `sidenav` leaf `"label": "Side nav"` → `"label": "Local navigation"`.
- Insert, immediately after the `sidenav` leaf and before `inpagenav`:
```json
{ "type": "page", "label": "Section sub-nav", "ref": "components/subnav/", "id": "subnav" },
```

- [ ] **Step 4: Validate JSON + assertions**

Run: `node -e "const m=JSON.parse(require('fs').readFileSync('manifest.json','utf8')); const c=m.components.find(x=>x.id==='subnav'); const s=m.components.find(x=>x.id==='sidenav'); console.log('subnav:', !!c, 'sidenav stable:', s.status==='stable')"`
Expected: `subnav: true sidenav stable: true`.
Run: `grep -c '"Local navigation"' manifest.json`
Expected: `>= 1`.

- [ ] **Step 5: Commit (checkpoint)**

```bash
git add manifest.json
git commit -m "feat(manifest): add subnav; promote sidenav to stable; rename nav leaf to Local navigation"
```

---

## Task 5: `wire-subnav` component page

**Files:**
- Create: `components/subnav/index.html`

> Load `preview-component-page` for the scaffold. Chrome (head, `<!-- NAV:START/END -->`, footer, shell body class) is generated by `build-ia.mjs` in Task 8 — scaffold the page by copying `components/in-page-nav/index.html` and replacing the `<main>` with the content below, then let Task 8 sync the rail/footer.

- [ ] **Step 1: Verify absent**

Run: `test -f components/subnav/index.html && echo PRESENT || echo ABSENT`
Expected: `ABSENT`.

- [ ] **Step 2: Scaffold from a sibling page**

Run: `mkdir -p components/subnav && cp components/in-page-nav/index.html components/subnav/index.html`
Then update `<title>` to `Section sub-nav — Preview Design System`.

- [ ] **Step 3: Replace the breadcrumb + doc-header**

```html
<nav class="wire-breadcrumb" aria-label="Breadcrumb">
  <ol class="wire-breadcrumb__list">
    <li class="wire-breadcrumb__item"><a class="wire-breadcrumb__link" href="../../components/">Components</a></li>
    <li class="wire-breadcrumb__item"><a class="wire-breadcrumb__link" href="../#cat-navigation">Navigation</a></li>
    <li class="wire-breadcrumb__item"><span class="wire-breadcrumb__current" aria-current="page">Section sub-nav</span></li>
  </ol>
</nav>

<header class="wire-doc-header">
  <div class="wire-doc-header__row">
    <h1 class="wire-doc-header__title">Section sub-nav</h1>
    <span class="wire-doc-header__status"><span class="wire-status-pill">Stable</span></span>
  </div>
  <p class="wire-doc-header__lead">A horizontal row of sibling links for one level of local navigation, sitting just under the global top nav — the compact, content-first counterpart to the left rail. Use it for a shallow set of peers when you want to keep the content column full-width.</p>
  <ul class="wire-doc-header__meta" role="list">
    <li class="wire-doc-header__meta-item">css/components/subnav.css</li>
    <li class="wire-doc-header__meta-item">Molecule</li>
  </ul>
</header>
```

- [ ] **Step 4: Replace the tablist labels**

Keep three tabs (Usage/Specs/Accessibility); set `aria-label="Section sub-nav documentation"` on the tablist and ids `tab-usage`/`tab-specs`/`tab-accessibility` (already present from the copy — just confirm).

- [ ] **Step 5: Usage panel content**

Inside the Usage `wire-shell__doc` left column, replace the sections with:
```html
<section id="live-demo" class="doc-section">
  <h2 class="wire-h3">Live demo</h2>
  <p class="u-text-muted u-mt-sm">A single level of peers under the masthead. The current page takes an accent underline and heavier weight; the row scrolls horizontally before it ever wraps.</p>
  <div class="doc-example doc-example--flush">
    <span class="doc-example__label">Section sub-nav</span>
    <nav class="wire-subnav" aria-label="Plan your visit (demo)">
      <ul class="wire-subnav__list" role="list">
        <li class="wire-subnav__item"><a class="wire-subnav__link is-current" href="#" aria-current="page">Before your visit</a></li>
        <li class="wire-subnav__item"><a class="wire-subnav__link" href="#">Parking &amp; transit</a></li>
        <li class="wire-subnav__item"><a class="wire-subnav__link" href="#">What to bring</a></li>
        <li class="wire-subnav__item"><a class="wire-subnav__link" href="#">Visitor policies</a></li>
        <li class="wire-subnav__item"><a class="wire-subnav__link" href="#">Amenities &amp; food</a></li>
      </ul>
    </nav>
  </div>
</section>

<section id="anatomy" class="doc-section">
  <h2 class="wire-h3">Anatomy</h2>
  <table class="doc-spec-table">
    <thead><tr><th scope="col">Part</th><th scope="col">Class</th><th scope="col">Role</th></tr></thead>
    <tbody>
      <tr><th scope="row">Bar</th><td><code>.wire-subnav</code></td><td>A <code>&lt;nav&gt;</code> with a section <code>aria-label</code>.</td></tr>
      <tr><th scope="row">List</th><td><code>.wire-subnav__list</code></td><td>Horizontal <code>&lt;ul role="list"&gt;</code>; scrolls on overflow.</td></tr>
      <tr><th scope="row">Link</th><td><code>.wire-subnav__link</code></td><td>One peer; <code>.is-current</code> + <code>aria-current="page"</code> marks the active page.</td></tr>
    </tbody>
  </table>
</section>

<section id="when" class="doc-section">
  <h2 class="wire-h3">When to use</h2>
  <ul>
    <li>One level of local nav with <strong>2–7 peers</strong>, where keeping the content column full-width matters.</li>
    <li>Content-first pages (articles, profiles, plan-your-visit) under the global top nav — the inverted-L.</li>
    <li>For 8+ peers or more than one level, use the <a href="../side-nav/">left rail</a>; for within-page anchors, <a href="../in-page-nav/">In-page nav</a>; for site destinations, <a href="../top-nav/">Top nav</a>.</li>
  </ul>
</section>

<section id="do-dont" class="doc-section">
  <h2 class="wire-h3">Do / Don't</h2>
  <div class="doc-do-dont">
    <div class="doc-do-dont__cell doc-do-dont__cell--do">
      <p class="doc-do-dont__label">Do</p>
      <ul>
        <li>Label the bar for the section it serves.</li>
        <li>Set <code>aria-current="page"</code> on the active link.</li>
        <li>Let the row scroll on narrow screens.</li>
      </ul>
    </div>
    <div class="doc-do-dont__cell doc-do-dont__cell--dont">
      <p class="doc-do-dont__label">Don't</p>
      <ul>
        <li>Stack it into two rows — switch to a rail instead.</li>
        <li>Nest a second level under it.</li>
        <li>Rely on the underline alone; keep <code>aria-current</code>.</li>
      </ul>
    </div>
  </div>
</section>
```
Update that panel's `wire-inpagenav` TOC to the four ids: `live-demo`, `anatomy`, `when`, `do-dont`.

- [ ] **Step 6: Specs panel content**

```html
<section id="structure" class="doc-section">
  <h2 class="wire-h3">Structure</h2>
  <ul>
    <li>A horizontal flex row with a bottom rule; items never shrink (<code>flex: 0 0 auto</code>) and the list scrolls on overflow rather than wrapping.</li>
    <li>The current item carries an accent bottom border and semibold weight — both read in grayscale.</li>
  </ul>
</section>
<section id="tokens" class="doc-section">
  <h2 class="wire-h3">Tokens</h2>
  <table class="doc-spec-table">
    <thead><tr><th scope="col">Property</th><th scope="col">Token</th></tr></thead>
    <tbody>
      <tr><th scope="row">Item gap</th><td><code>--space-2xs</code></td></tr>
      <tr><th scope="row">Link padding</th><td><code>--space-md</code> · <code>--space-sm</code></td></tr>
      <tr><th scope="row">Link text</th><td><code>--text-sm</code>, <code>--weight-medium</code></td></tr>
      <tr><th scope="row">Current bar</th><td><code>--color-accent</code> · <code>--border-md</code></td></tr>
      <tr><th scope="row">Bottom rule</th><td><code>--color-border</code> · <code>--border-thin</code></td></tr>
    </tbody>
  </table>
</section>
<section id="snippet" class="doc-section">
  <h2 class="wire-h3">Snippet</h2>
  <pre class="doc-snippet">&lt;nav class="wire-subnav" aria-label="Plan your visit"&gt;
  &lt;ul class="wire-subnav__list" role="list"&gt;
    &lt;li class="wire-subnav__item"&gt;&lt;a class="wire-subnav__link is-current" href="/before" aria-current="page"&gt;Before your visit&lt;/a&gt;&lt;/li&gt;
    &lt;li class="wire-subnav__item"&gt;&lt;a class="wire-subnav__link" href="/parking"&gt;Parking &amp;amp; transit&lt;/a&gt;&lt;/li&gt;
  &lt;/ul&gt;
&lt;/nav&gt;</pre>
</section>
```
Set that panel's TOC ids to `structure`, `tokens`, `snippet`.

- [ ] **Step 7: Accessibility panel content**

```html
<section id="landmark" class="doc-section">
  <h2 class="wire-h3">Landmark &amp; labeling</h2>
  <ul>
    <li>Wrap the bar in <code>&lt;nav&gt;</code> with a label naming the section; if the page has other nav landmarks, each needs a distinct <code>aria-label</code>.</li>
  </ul>
</section>
<section id="current" class="doc-section">
  <h2 class="wire-h3">Current page</h2>
  <ul>
    <li>Set <code>aria-current="page"</code> on the active link alongside <code>.is-current</code>. The underline is presentational only.</li>
  </ul>
</section>
<section id="targets" class="doc-section">
  <h2 class="wire-h3">Targets &amp; scrolling</h2>
  <ul>
    <li>Links meet the ≥44px target (<code>min-block-size: 2.75rem</code>).</li>
    <li>Horizontal scroll uses native overflow — keyboard focus moves through links in order and is never trapped.</li>
  </ul>
</section>
```
Set TOC ids to `landmark`, `current`, `targets`.

- [ ] **Step 8: Update the doc pager**

```html
<nav class="wire-doc-pager" aria-label="Component pagination">
  <a class="wire-doc-pager__link wire-doc-pager__link--prev" href="../side-nav/">
    <span class="wire-doc-pager__direction">Previous in Navigation</span>
    <span class="wire-doc-pager__title">Local navigation</span>
  </a>
  <a class="wire-doc-pager__link wire-doc-pager__link--next" href="../in-page-nav/">
    <span class="wire-doc-pager__direction">Next in Navigation</span>
    <span class="wire-doc-pager__title">In-page nav</span>
  </a>
</nav>
```

- [ ] **Step 9: Verify class resolution + single h1**

Run: `grep -oE 'wire-subnav[a-z_-]*' components/subnav/index.html | sort -u`
Expected: only `wire-subnav`, `wire-subnav__list`, `wire-subnav__item`, `wire-subnav__link` (all defined in Task 1).
Run: `grep -c "<h1" components/subnav/index.html`
Expected: `1`.

- [ ] **Step 10: Commit (checkpoint)**

```bash
git add components/subnav/index.html
git commit -m "docs(subnav): add Section sub-nav component page"
```

---

## Task 6: Rewrite the Side nav page → "Local navigation"

**Files:**
- Modify: `components/side-nav/index.html`

This grows the page from one component into the family hub. Keep the existing Usage demo + the three sidenav patterns; add the framework, the five-variant gallery, and the deep-hierarchy section. Keep the slug `side-nav/`.

- [ ] **Step 1: Retitle the page**

- `<title>` → `Local navigation — Preview Design System`
- Breadcrumb current → `Local navigation`
- `wire-doc-header__title` → `Local navigation`
- `wire-doc-header__lead` → `The family of within-section navigation: left rails, a horizontal section bar, a contextual right rail, master-detail, and the mobile drawer. This page is the decision guide — which local nav to use, why, and where — plus the deep-hierarchy model for pages that sit many levels down.`
- Doc pager: leave prev (`../top-nav/` Top nav); set next to `../subnav/` "Section sub-nav".

- [ ] **Step 2: Add the "Choosing a variant" section (Usage tab, after Live demo)**

```html
<section id="choosing" class="doc-section">
  <h2 class="wire-h3">Choosing a variant</h2>
  <p class="u-text-muted u-mt-sm">Two questions decide it. First, <strong>is navigation or content the protagonist?</strong> Nav-primary screens (consoles, dashboards) lean on a persistent left rail; content-primary screens (articles, profiles) keep content full-width and push contextual nav to a horizontal bar or the right rail. Second, <strong>how deep is the IA?</strong> Shallow and few peers favor a horizontal bar; broad or growing favors a left rail; truly deep is solved by scoping the rail and letting the breadcrumb carry ancestry (see below). Local nav should always read as <em>less salient</em> than the global nav.</p>
  <table class="doc-spec-table">
    <thead><tr><th scope="col">If…</th><th scope="col">Use</th></tr></thead>
    <tbody>
      <tr><th scope="row">≤1 level, 2–7 peers, content-first</th><td>Horizontal <a href="../subnav/">section sub-nav</a></td></tr>
      <tr><th scope="row">Broad/growing IA, 4–12 peers, nav-first</th><td>Left rail (<code>wire-sidenav</code>)</td></tr>
      <tr><th scope="row">Long reading page</th><td>Quiet left rail + right-rail <a href="../in-page-nav/">in-page nav</a></td></tr>
      <tr><th scope="row">Deepest node is an entity viewed many ways</th><td>Master-detail (list + tabs)</td></tr>
      <tr><th scope="row">Small screen</th><td>Off-canvas <a href="../drawer/">drawer</a> holding the rail</td></tr>
      <tr><th scope="row">≥4 levels deep</th><td>Scope the rail + <a href="../breadcrumb/">breadcrumb</a> for ancestry</td></tr>
    </tbody>
  </table>
</section>
```

- [ ] **Step 3: Add the "Five variants" gallery (Usage tab, after the existing "Three patterns")**

```html
<section id="variants" class="doc-section">
  <h2 class="wire-h3">The five variants</h2>
  <p class="u-text-muted u-mt-sm">One family, five form factors. The left rail and the section bar are components; the right rail, master-detail, and mobile drawer are compositions of parts you already have.</p>

  <h3 class="wire-h5 u-mt-lg">1 · Left rail — within-section</h3>
  <p class="u-text-muted u-mt-sm">The workhorse. Peers, parent + children, or a shallow tree. See the three patterns above. Nav-primary screens and growing IAs; the leading edge. Add <code>wire-sidenav--sticky</code> to pin it beside long content.</p>

  <h3 class="wire-h5 u-mt-xl">2 · Horizontal section sub-nav</h3>
  <p class="u-text-muted u-mt-sm">A single row of peers under the masthead — the inverted-L. Keeps the content column full-width. Best for 2–7 peers, one level.</p>
  <div class="doc-example doc-example--flush">
    <span class="doc-example__label">wire-subnav</span>
    <nav class="wire-subnav" aria-label="Plan your visit (demo)">
      <ul class="wire-subnav__list" role="list">
        <li class="wire-subnav__item"><a class="wire-subnav__link is-current" href="#" aria-current="page">Before your visit</a></li>
        <li class="wire-subnav__item"><a class="wire-subnav__link" href="#">Parking &amp; transit</a></li>
        <li class="wire-subnav__item"><a class="wire-subnav__link" href="#">What to bring</a></li>
        <li class="wire-subnav__item"><a class="wire-subnav__link" href="#">Visitor policies</a></li>
      </ul>
    </nav>
  </div>
  <p class="u-text-muted u-mt-sm">Full specs: <a href="../subnav/">Section sub-nav</a>.</p>

  <h3 class="wire-h5 u-mt-xl">3 · Right-rail contextual nav</h3>
  <p class="u-text-muted u-mt-sm">On long reading pages, the right rail carries an "On this page" table of contents and related links — never the primary structural nav (right-rail blindness). Compose <code>wire-two-column</code> + <a href="../in-page-nav/">in-page nav</a>.</p>
  <div class="doc-example">
    <span class="doc-example__label">In-page nav (right-rail role)</span>
    <nav class="wire-inpagenav" aria-label="On this page (demo)">
      <p class="wire-inpagenav__title">On this page</p>
      <ul class="wire-inpagenav__list" role="list">
        <li class="wire-inpagenav__item"><a class="wire-inpagenav__link is-current" href="#">Overview</a></li>
        <li class="wire-inpagenav__item"><a class="wire-inpagenav__link" href="#">Symptoms</a></li>
        <li class="wire-inpagenav__item"><a class="wire-inpagenav__link" href="#">Treatment</a></li>
        <li class="wire-inpagenav__item"><a class="wire-inpagenav__link" href="#">Recovery</a></li>
      </ul>
    </nav>
  </div>

  <h3 class="wire-h5 u-mt-xl">4 · Master-detail</h3>
  <p class="u-text-muted u-mt-sm">When the deepest node is an entity viewed many ways, it isn't a dead end: a list of objects on the left, the object's facets as <a href="../tabs/">tabs</a>, breadcrumb for ancestry.</p>
  <div class="doc-example">
    <span class="doc-example__label">List + tabbed object</span>
    <nav class="wire-sidenav" aria-label="Providers (demo)">
      <div class="wire-sidenav__group">
        <div class="wire-sidenav__title">Providers</div>
        <ul class="wire-sidenav__list" role="list">
          <li class="wire-sidenav__item"><a class="wire-sidenav__link is-current" href="#" aria-current="page">Dr. Lena Ortiz</a></li>
          <li class="wire-sidenav__item"><a class="wire-sidenav__link" href="#">Dr. Sam Reed</a></li>
          <li class="wire-sidenav__item"><a class="wire-sidenav__link" href="#">Dr. Priya Shah</a></li>
        </ul>
      </div>
    </nav>
  </div>

  <h3 class="wire-h5 u-mt-xl">5 · Mobile drawer</h3>
  <p class="u-text-muted u-mt-sm">On small screens the rail collapses into an off-canvas <a href="../drawer/">drawer</a> opened by the top-nav burger (<code>data-wire-drawer-open</code>); the same <code>wire-sidenav</code> markup rides inside it. No drilldown — depth is handled by scoping + breadcrumb.</p>
</section>
```

- [ ] **Step 4: Add the "Deep hierarchy & the dead-end leaf" section**

```html
<section id="deep-hierarchy" class="doc-section">
  <h2 class="wire-h3">Deep hierarchy &amp; the dead-end leaf</h2>
  <p class="u-text-muted u-mt-sm">A page five levels down with no children is not a taller rail problem — it's a division of labor. Don't render five indented levels. Scope the rail to the nearest branch and let the breadcrumb carry the way back.</p>
  <table class="doc-spec-table">
    <thead><tr><th scope="col">Relationship</th><th scope="col">Rendered by</th></tr></thead>
    <tbody>
      <tr><th scope="row">Ancestors (going back)</th><td><a href="../breadcrumb/">Breadcrumb</a> — scales to any depth</td></tr>
      <tr><th scope="row">Siblings + current</th><td>Rail scoped to the nearest branch (<code>__link--parent</code> + sibling list)</td></tr>
      <tr><th scope="row">Children</th><td>None — it's a leaf; the rail shows lateral peers instead</td></tr>
      <tr><th scope="row">Current page</th><td><code>.is-current</code> + <code>aria-current="page"</code> — exactly one</td></tr>
    </tbody>
  </table>
  <div class="doc-example">
    <span class="doc-example__label">Scoped rail at a deep leaf (breadcrumb carries ancestry)</span>
    <nav class="wire-breadcrumb" aria-label="Breadcrumb (demo)">
      <ol class="wire-breadcrumb__list">
        <li class="wire-breadcrumb__item"><a class="wire-breadcrumb__link" href="#">Care</a></li>
        <li class="wire-breadcrumb__item"><a class="wire-breadcrumb__link" href="#">Rehabilitation</a></li>
        <li class="wire-breadcrumb__item"><a class="wire-breadcrumb__link" href="#">Spinal cord injury</a></li>
        <li class="wire-breadcrumb__item"><span class="wire-breadcrumb__current" aria-current="page">Day of your visit</span></li>
      </ol>
    </nav>
    <nav class="wire-sidenav" aria-label="Spinal cord injury (demo)">
      <div class="wire-sidenav__group">
        <a class="wire-sidenav__link wire-sidenav__link--parent" href="#">Spinal cord injury</a>
        <ul class="wire-sidenav__list" role="list">
          <li class="wire-sidenav__item"><a class="wire-sidenav__link" href="#">Before your visit</a></li>
          <li class="wire-sidenav__item"><a class="wire-sidenav__link is-current" href="#" aria-current="page">Day of your visit</a></li>
          <li class="wire-sidenav__item"><a class="wire-sidenav__link" href="#">Parking &amp; transit</a></li>
          <li class="wire-sidenav__item"><a class="wire-sidenav__link" href="#">What to bring</a></li>
        </ul>
      </div>
    </nav>
  </div>
  <p class="u-text-muted u-mt-sm">This keeps best practice and the system's two-level rail cap aligned: depth lives in the breadcrumb, not in indentation.</p>
</section>
```

- [ ] **Step 5: Update the Usage-tab TOC**

Set the Usage panel's `wire-inpagenav` list to: `live-demo`, `choosing`, `anatomy`, `patterns`, `variants`, `deep-hierarchy`, `when`, `do-dont`.

- [ ] **Step 6: Extend Specs + Accessibility tabs**

- Specs → Anatomy table: add rows for `.wire-sidenav--sticky` (modifier: "pins the rail beside long content; released below 48em") and a note that the horizontal peer bar is its own component, `wire-subnav` (link).
- Accessibility → add a "Multiple nav landmarks" bullet under Landmark: "A page may carry several nav landmarks (rail, breadcrumb, in-page). Give each a distinct `aria-label` so they're tellable apart." Add a reflow bullet for `--sticky`.

- [ ] **Step 7: Verify class resolution, links, single h1**

Run: `grep -oE 'wire-(subnav|sidenav|inpagenav|breadcrumb|two-column)[a-z_-]*' components/side-nav/index.html | sort -u`
Expected: only classes defined in `css/` (cross-check `wire-two-column` exists: `grep -rn "wire-two-column" css/components/two-column.css`; if its element classes differ, fix the variant-3 prose to match — do not invent classes).
Run: `grep -c "<h1" components/side-nav/index.html`
Expected: `1`.

- [ ] **Step 8: Commit (checkpoint)**

```bash
git add components/side-nav/index.html
git commit -m "docs(local-nav): rework Side nav into Local navigation hub (framework, 5 variants, deep hierarchy)"
```

---

## Task 7: Demo use, research row, directory, changelog

**Files:**
- Modify: `pages/hospital-specialty.html`
- Modify: `docs/research.html`
- Modify: `directory.html`
- Modify: `CHANGELOG.md`

- [ ] **Step 1: Add a real `wire-subnav` to one demo page**

Open `pages/hospital-specialty.html`. Directly under the page's `wire-topnav` (and above the hero/main content), insert a section sub-nav scoped to the specialty, e.g.:
```html
<nav class="wire-subnav" aria-label="Rehabilitation">
  <ul class="wire-subnav__list" role="list">
    <li class="wire-subnav__item"><a class="wire-subnav__link is-current" href="#" aria-current="page">Overview</a></li>
    <li class="wire-subnav__item"><a class="wire-subnav__link" href="#">Conditions we treat</a></li>
    <li class="wire-subnav__item"><a class="wire-subnav__link" href="#">Our team</a></li>
    <li class="wire-subnav__item"><a class="wire-subnav__link" href="#">Locations</a></li>
    <li class="wire-subnav__item"><a class="wire-subnav__link" href="#">Make an appointment</a></li>
  </ul>
</nav>
```
(Match the existing page's container conventions — wrap in the same `u-container`/section wrapper the page uses for its bands. Read the file first; don't introduce doc-chrome.)

- [ ] **Step 2: Add the research component-basis row**

In `docs/research.html`, add a row for `subnav` to the component-basis table, tagged Evidence/Convention, citing `nng-local-navigation` / `uswds-side-navigation` (match the table's existing row format).

- [ ] **Step 3: Update `directory.html`**

Add a `subnav` entry under Navigation and bump the component/reference counts to match the new total.

- [ ] **Step 4: Update `CHANGELOG.md`**

Under the next minor (or an Unreleased block), add:
```
- Add `wire-subnav` (Section sub-nav) component and page.
- Rework Side nav page into "Local navigation" hub: variant decision framework, five variants, deep-hierarchy model.
- Promote `wire-sidenav` sublist/parent compositions to stable; add `--sticky` modifier.
- Add 5 verified local-nav citations; fix a stale NN/g URL.
```

- [ ] **Step 5: Verify demo + counts**

Run: `grep -c "wire-subnav" pages/hospital-specialty.html`
Expected: `>= 1`.
Run: `grep -in "subnav" directory.html docs/research.html CHANGELOG.md`
Expected: matches in all three.

- [ ] **Step 6: Commit (checkpoint)**

```bash
git add pages/hospital-specialty.html docs/research.html directory.html CHANGELOG.md
git commit -m "docs: wire subnav into a demo, research basis, directory, changelog"
```

---

## Task 8: Regenerate nav + full validation

**Files:**
- Generated: `partials/nav.html`, the NAV block in every chrome page, `components/subnav/` chrome sync.

- [ ] **Step 1: Run the generator**

Run: `node scripts/build-ia.mjs`
Expected: completes; reports the rail rebuild; the `subnav` leaf appears in the Navigation group; the "Local navigation" label updates; `components/subnav/index.html` gets the chrome (NAV/footer/shell) synced and `aria-current` stamped on its leaf.

- [ ] **Step 2: Verify idempotency**

Run: `node scripts/build-ia.mjs && git status --porcelain | grep -E "components/|partials/" | head`
Expected: a second run produces no further diff beyond the first (idempotent).

- [ ] **Step 3: Verify the rail reflects the change**

Run: `grep -n "Local navigation\|Section sub-nav" partials/nav.html`
Expected: both labels present, subnav linking `components/subnav/`.

- [ ] **Step 4: Class-resolution audit across changed pages**

Run: `for f in components/subnav/index.html components/side-nav/index.html pages/hospital-specialty.html; do echo "== $f =="; grep -oE 'wire-[a-z]+(__[a-z-]+)?(--[a-z]+)?' "$f" | sort -u | while read c; do base=$(echo "$c" | sed 's/__.*//;s/--.*//'); grep -rqs "$c\|$base" css/ || echo "UNRESOLVED: $c"; done; done`
Expected: no `UNRESOLVED` lines.

- [ ] **Step 5: Accessibility gate**

Run: `npx --yes pa11y-ci --config .pa11yci.json` (or add the new URLs if the config enumerates pages)
Expected: 0 errors on `components/subnav/`, `components/side-nav/`, `pages/hospital-specialty.html`.

- [ ] **Step 6: Visual / render QA**

Run: `npm run serve` then open `http://localhost:8080/components/side-nav/`, `/components/subnav/`, `/pages/hospital-specialty.html`.
Check, in light and dark, desktop and ≤390px width:
- Subnav: current underline visible; row scrolls (doesn't wrap) on narrow; ≥44px targets.
- Local navigation hub: all five demos render; decision table and deep-hierarchy demo read correctly; Usage TOC links resolve.
- Sidenav `--sticky` (if demoed) pins on desktop, releases on phone.
- No color introduced; still grayscale.
- Rail shows "Local navigation" + "Section sub-nav"; current page stamped.

- [ ] **Step 7: Broken-link sweep on changed pages**

Run: `grep -oE 'href="[^"#][^"]*"' components/subnav/index.html components/side-nav/index.html | sed 's/.*href="//;s/"//' | sort -u`
Manually confirm each relative target exists (e.g., `../subnav/`, `../in-page-nav/`, `../drawer/`, `../tabs/`, `../breadcrumb/`).

- [ ] **Step 8: Commit (checkpoint)**

```bash
git add -A
git commit -m "build(nav): regenerate rail with Local navigation + Section sub-nav; sync chrome"
```

---

## Self-Review

**Spec coverage:**
- Rename → Task 6 Step 1. ✓
- `wire-subnav` component + page → Tasks 1, 5. ✓
- `wire-sidenav` promote + `--sticky` → Task 2, Task 4 Step 1, Task 6 Step 6. ✓
- Five variants documented → Task 6 Step 3. ✓
- Deep-hierarchy model → Task 6 Step 4. ✓
- Decision framework → Task 6 Step 2. ✓
- Manifest (sidenav, subnav, nav tree) → Task 4. ✓
- Citations (5 new + URL fix, verified) → Task 3. ✓
- Demo use, research, directory, changelog → Task 7. ✓
- Nav regen + validation gates → Task 8. ✓
- Accessibility requirements (landmarks, aria-current, targets, reflow) → Tasks 5/6 content + Task 8 Step 5. ✓

**Placeholder scan:** No TBD/TODO. The one conditional ("if `wire-two-column` element classes differ, match them") is a real guard against inventing classes, with a concrete grep — not a placeholder. HTML chrome is generated by `build-ia.mjs` (Task 8), which is the correct mechanism, not an omission.

**Type/name consistency:** `wire-subnav` / `__list` / `__item` / `__link` used identically in Tasks 1, 5, 6, 7. `wire-sidenav--sticky` consistent in Tasks 2, 4, 6. Citation ids consistent between Task 3 (defined) and Task 4/6 (referenced). Page slug `side-nav/` preserved throughout.
