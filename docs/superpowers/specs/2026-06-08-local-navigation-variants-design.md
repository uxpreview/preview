# Local navigation — page rework + five variants

**Date:** 2026-06-08
**Status:** Approved (pending spec review)
**Author:** Ryan McCarty (with Claude)
**Supersedes/relates:** `2026-06-02-nav-ia-rework-design.md` (that spec reworked the
doc-site rail chrome; this one reworks the reusable `wire-sidenav` component page and
the local-navigation family. No overlap — different layer.)

---

## 1. Summary

Turn the single-component **Side nav** page into the design system's hub for
**local / secondary navigation**, backed by research, and ship the family as
reusable library artifacts so client work can compose the right variant with
cited reasoning.

Three things happen:

1. **Rename + expand** `components/side-nav/index.html` from "Side nav" to
   **"Local navigation"** — the comprehensive reference: a decision framework,
   five variants with live demos, and the deep-hierarchy / dead-end-leaf model.
   The folder slug stays `side-nav/` (path renames are the Phase-2 migration the
   `2026-06-02` spec defers).
2. **Build the one genuinely-new atom**, `wire-subnav` (horizontal section
   sub-nav), as a first-class component with its own page, matching the family
   convention (top-nav, in-page-nav, breadcrumb each have their own page).
3. **Promote and extend `wire-sidenav`**: lift the beta `__link--parent` /
   `__sublist` compositions to stable (they carry the scoped deep-hierarchy
   pattern) and add a `--sticky` modifier.

## 2. Goals / non-goals

**Goals**
- One authoritative place that answers "which local nav, and why, for this project."
- Every variant is tangible: a component, a modifier, or a documented composition
  with real demo markup a designer can copy.
- Every non-obvious decision is tiered and cited to `citations.json`.
- Faithful to the system: grayscale, tokens-only, BEM `wire-`, no new tokens, no
  inline styles, no JS unless a behavior needs it (none here).

**Non-goals**
- No drilldown / push-panel pattern (deep hierarchy is solved by scoping the rail
  + breadcrumb; decision locked).
- No folder/path renames (Phase 2).
- No redundant atoms for variants that are really placements or compositions
  (right-rail, master-detail, mobile drawer) — building a `wire-rightrail` or
  `wire-masterdetail` would duplicate `wire-inpagenav` / `wire-tabs`, which the
  system forbids.
- No changes to the doc-site rail chrome (`wire-doc-nav` / `wire-railnav`).

## 3. Locked decisions

| Decision | Choice |
|---|---|
| Build depth | Build all five as library artifacts (new atom where there's a gap, modifiers + documented compositions otherwise) |
| Page identity | Rename "Side nav" → "Local navigation"; keep `side-nav/` slug |
| Deep hierarchy | Scoped rail (parent header + siblings + current) + breadcrumb carries ancestry; keep the 2-level rail cap; no drilldown |
| Variants 3-5 form | Composition / modifier patterns, not new atoms (author's deference) |
| Citations | Verified by author; added to `citations.json` with `verified_date` set |

## 4. The five variants → library artifacts

| # | Variant (archetype) | Library form | New CSS | When / why / where |
|---|---|---|---|---|
| 1 | Left rail — within-section | `wire-sidenav` (promote beta to stable; add `--sticky`) | modifier only | Nav-primary or within-section movement, 4-12 peers, growing IAs; leading edge |
| 2 | Horizontal section sub-nav (top local / inverted-L) | **NEW `wire-subnav`** | new component + page | Shallow IA (1 level), 2-7 siblings, content-primary wanting max width; sits below the global top nav |
| 3 | Right-rail contextual nav | `wire-inpagenav` + right-rail layout (reuse `wire-two-column` / shell content+TOC grid); optional related-content list | layout/placement | Content-primary long pages; "On this page" + related links; never primary structural nav |
| 4 | Master-detail (list + tabbed object views) | composition: `wire-sidenav` or list + `wire-tabs` + `wire-breadcrumb` | none | Deepest node is an entity viewed many ways; comparison across records; "the tier-5 leaf is really an object" |
| 5 | Mobile drawer (off-canvas local nav) | composition: `wire-drawer` (+`--start`) housing `wire-sidenav`; burger via `data-wire-drawer-open` | none | Small screens; the left rail collapses off-canvas; no drilldown |

## 5. New component — `wire-subnav`

A horizontal row of sibling links for a single level of local navigation, placed
directly under the global top nav (the inverted-L). The compact, content-first
counterpart to the left rail.

**Page:** `components/subnav/index.html` (3-tab template: Usage / Specs /
Accessibility), placed in the Navigation group between Local navigation and
In-page nav.

**CSS:** new file `css/components/subnav.css`, imported alphabetically in
`css/wire.css` (after `stepper`/`status-pill`, before `table` — exact alpha slot
to be confirmed against the import block at build).

**Classes (BEM):**

| Class | Role |
|---|---|
| `.wire-subnav` | `<nav>` wrapper with a section `aria-label`; horizontal flex row |
| `.wire-subnav__list` | `<ul role="list">`, horizontal, `flex-wrap` on wide / horizontal scroll on narrow |
| `.wire-subnav__item` | `<li>` |
| `.wire-subnav__link` | One destination; min target ≥44px; bottom or leading accent on current |
| `.wire-subnav__link.is-current` + `aria-current="page"` | Active page marker (accent + weight, never color alone) |

**Behavior / responsive:** static links, no JS. On narrow viewports the list
scrolls horizontally (`overflow-x:auto`, `overscroll-behavior-x:contain`) rather
than wrapping into a tall block; momentum-scroll friendly. Current item uses an
accent underline (`--color-accent`, `--border-md`) plus `--weight-semibold` so it
reads in grayscale.

**Tokens only:** spacing `--space-*`, text `--text-sm`, weight tokens, `--radius-sm`,
`--color-accent` / `--color-text` / `--color-bg-muted` / `--color-border`. No raw
values (passes the `grep -rE '[0-9]+px|#[0-9a-fA-F]'` gate).

**A11y:** `<nav aria-label="…">` distinct from other nav landmarks on the page;
`aria-current="page"` on the active link; visible focus; ≥44px targets; horizontal
scroll never traps keyboard focus.

**When NOT to use:** more than ~7 siblings, or more than one level (→ left rail);
within-page anchors (→ in-page nav); site-level destinations (→ top nav).

## 6. `wire-sidenav` changes

- **Promote beta → stable.** `__link--parent` and `__sublist` are documented as
  stable; they are the mechanism for the scoped deep-hierarchy pattern. Manifest
  `status` becomes `"stable"`.
- **Add `.wire-sidenav--sticky`** (in `css/components/nav.css`): sticky within a
  content column on tablet+, released below 48em — the same reflow guard
  `wire-inpagenav` uses, so a tall rail never traps content on phones.
- **No structural change** to existing classes; the 2-level nesting cap stays.

## 7. Deep hierarchy & the dead-end leaf (page content model)

The page documents the worked model for a tier-5 leaf with no children. Division
of labor, not a taller rail:

| Relationship | Rendered by | Note |
|---|---|---|
| Ancestors (going back) | `wire-breadcrumb` | Compact, linear, scales to any depth |
| Siblings + current | `wire-sidenav` scoped to the nearest branch (`__link--parent` header + sibling list) | The leaf's most useful moves are lateral |
| Children | n/a — it's a leaf | Rail shows lateral options instead |
| Current page | `.is-current` + `aria-current="page"` | Exactly one active item |

Three documented strategies, each as a live demo: (a) scoped sidebar + breadcrumb
(default); (b) auto-expanding accordion with a depth cap; (c) master-detail when
the leaf is really an entity (variant 4). This keeps best practice (NN/g,
Cloudscape) and the system's existing 2-level cap aligned — the page makes that
alignment explicit rather than fighting it.

## 8. Page content outline (where the research lands)

**Usage tab**
1. Live demo (kept — grouped rail)
2. **Choosing a local-nav variant** (NEW): the two axes — *is navigation or content
   the protagonist?* and *how deep is the IA?* — plus the cheat-sheet decision
   table. Cites `nng-primary-secondary`, `nng-local-navigation`, `nng-visual-hierarchy`.
3. **The five variants** (NEW): one subsection each, live demo + when/why/where,
   cross-linking `top-nav` and `in-page-nav`. Right-rail subsection states the
   secondary-only rule (`nng-right-rail-blindness`).
4. **Deep hierarchy & the dead-end leaf** (NEW): the Section-7 model + tier-5
   worked example. Cites `nng-local-navigation`, `nng-you-are-here`,
   `cloudscape-side-navigation`, `ibm-carbon-side-nav`.
5. When to use / Do-Don't (kept, expanded)

**Specs tab**: extend Anatomy/States/Tokens to cover `--sticky` and reference the
new `wire-subnav` page; snippet for the scoped pattern.

**Accessibility tab**: keep landmark/current/targets; add the multi-landmark rule
(distinct `aria-label` per nav), reflow note for `--sticky`. Cites
`nng-you-are-here`, and the WCAG ids already used.

**References block**: render the citations used (via the evidence model), not a raw
link dump.

## 9. CSS — exact file touch-points

- **NEW** `css/components/subnav.css` — `wire-subnav` and elements (Section 5).
- **EDIT** `css/wire.css` — add `@import "components/subnav.css";` in alpha order.
- **EDIT** `css/components/nav.css` — add `.wire-sidenav--sticky` (sticky + sub-48em
  release).
- **VERIFY** `css/components/two-column.css` covers a content + right-rail layout
  for variant 3; add a minimal modifier only if it does not. (No new component.)
- No new tokens anywhere.

## 10. Manifest changes (`manifest.json`)

1. **Update `sidenav` entry**: `status: "stable"`; add `wire-sidenav--sticky` to a
   `modifiers` array; extend `rationale` to cite `nng-local-navigation` and
   `nng-you-are-here` alongside the existing ids; update `desc` to the local-nav
   framing.
2. **Add `subnav` component entry**:
   ```json
   {
     "id": "subnav",
     "level": "molecule",
     "category": "navigation",
     "class": "wire-subnav",
     "file": "css/components/subnav.css",
     "ref": "components/subnav/",
     "status": "stable",
     "elements": ["wire-subnav__list", "wire-subnav__item", "wire-subnav__link"],
     "states": ["is-current"],
     "rationale": [
       { "decision": "Horizontal section nav for shallow, content-first IAs",
         "citation_ids": ["nng-local-navigation", "uswds-side-navigation"] },
       { "decision": "aria-current=page on the active item",
         "citation_ids": ["wcag-4.1.2-name-role-value"] }
     ]
   }
   ```
3. **Nav tree** (the `navigation` group): rename the `sidenav` leaf label
   `"Side nav"` → `"Local navigation"`; insert a `subnav` leaf
   `{ "type": "page", "label": "Section sub-nav", "ref": "components/subnav/", "id": "subnav" }`
   immediately after it.

## 11. Citations (`citations.json`)

Entry shape: `{ id, tier, finding, source{org,title,year,url}, verified_date, verification, supports[] }`.

**Reuse (already present):** `nng-left-side-vertical-navigation`, `ibm-carbon-side-nav`,
`nng-table-of-contents`, `nng-mega-menus`, `nng-primary-secondary`,
`nng-hamburger-hidden-nav`, `nng-visual-hierarchy`, `nng-seniors`.

**Correct one stale field:** `nng-left-side-vertical-navigation.source.url` →
`https://www.nngroup.com/articles/vertical-nav/` (current canonical; the stored
`/articles/left-side-vertical-navigation/` is stale). Set `verified_date` =
`2026-06-08`.

**Add (verified 2026-06-08):**

| id | tier | source | supports |
|---|---|---|---|
| `nng-local-navigation` | empirical | NN/g, "Local Navigation Is a Valuable Orientation and Wayfinding Aid", nngroup.com/articles/local-navigation/ | sidenav, subnav, navigation |
| `nng-you-are-here` | empirical | NN/g, "Navigation: You Are Here", nngroup.com/articles/navigation-you-are-here/ | sidenav, breadcrumb, navigation |
| `nng-right-rail-blindness` | empirical | NN/g, "Fight Against Right-Rail Blindness", nngroup.com/articles/fight-right-rail-blindness/ | inpagenav, navigation |
| `cloudscape-side-navigation` | convention | AWS Cloudscape, "Side navigation pattern", cloudscape.design/patterns/general/service-navigation/side-navigation/ | sidenav, navigation |
| `uswds-side-navigation` | convention | U.S. Web Design System, "Side navigation", designsystem.digital.gov/components/side-navigation/ | sidenav, subnav, navigation |

`finding` strings, tiered honestly: NN/g = empirical; Carbon/Cloudscape/USWDS =
convention. Our composition calls (master-detail, right-rail-as-placement) =
**judgment**, stated as such inline on the page (no citation dressed up).

## 12. Other touch-points (CONTRIBUTING)

- **Demo use:** add a `wire-subnav` instance to one demo/template page (candidate:
  `templates/basic/section-landing/` or `pages/hospital-specialty.html`) so the
  component appears in ≥1 demo per the contributing rule.
- **`docs/research.html`:** add a component-basis row for `subnav` (Evidence tag).
- **`directory.html`:** bump component/reference counts; add subnav.
- **`CHANGELOG.md`:** entry under next minor (new component + page rename = minor).
- **Regenerate:** `node scripts/build-ia.mjs` (or the `sync-nav.mjs` shim) to emit
  the rail, stub the new `components/subnav/` if needed, and stamp current/aria
  across pages. Idempotent.

## 13. Accessibility requirements (all variants)

- Each nav is a `<nav>` landmark with a unique `aria-label`.
- `aria-current="page"` on the active link, independent of the `.is-current` visual
  marker; never color alone (grayscale already forces this).
- Targets ≥44px (subnav links, sidenav top links); sub-list links verified ≥24px.
- `--sticky` rails release below 48em (reflow, WCAG 1.4.10).
- Horizontal subnav scroll never traps keyboard focus.

## 14. Validation gates (run before done)

- Tokens grep: no raw px / hex in new CSS.
- Class-resolution audit: every `wire-*` used resolves in `css/`.
- One `<h1>` per page; heading hierarchy intact.
- `pa11y-ci` AA on changed pages.
- Light/dark + mobile/desktop render checks.
- Zero broken links (hub cross-links, pager, breadcrumb).
- `build-ia` re-run is idempotent.
- Every cited id exists in `citations.json`; no over-tiering.

## 15. Phasing (for the implementation plan)

1. `wire-subnav`: CSS + `wire.css` import + `components/subnav/index.html` page +
   manifest `subnav` entry + one demo use.
2. `wire-sidenav`: promote beta to stable; add `--sticky`; manifest update.
3. Citations: correct stale URL; add five entries (verified 2026-06-08).
4. Rewrite `components/side-nav/index.html` → "Local navigation": decision
   framework, five variant demos, deep-hierarchy section, expanded Specs/A11y,
   References. Rename title/breadcrumb/pager/`<title>`.
5. `docs/research.html` row, `directory.html` counts, `CHANGELOG.md`.
6. Regenerate nav; full validation; light/dark + mobile QA.
