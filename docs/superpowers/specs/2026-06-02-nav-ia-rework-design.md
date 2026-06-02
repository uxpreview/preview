# Design — Navigation IA rework + manifest-driven rail (phase 1)

**Date:** 2026-06-02
**Status:** approved (approach: manifest-driven generator)
**Scope:** the docs-site chrome only (rail nav, `manifest.json`, generated stubs). The
`pages/` demo mocks keep their own client nav and are only *linked* from the rail.

---

## Goal

Rework the left rail to the target IA in `preview/CLAUDE.md`'s structure block:
a new top-level set, a brand-new **Styles** tier, **two levels of disclosure**
(category groups become collapsible expanders), and stubs for the ~130 pages that
don't exist yet — without breaking the 25 existing component pages.

`manifest.json` becomes the single source of truth that *drives* the rail and the
stub set; `partials/nav.html` and the stubs become generated output.

---

## Decisions (locked)

1. **Phased / non-breaking.** Existing pages stay at their current real paths and are
   linked under the correct new group/label. Physically moving + renaming the 25
   component folders and the `docs/*.html` pages to the clean target paths is an
   explicit **phase 2**, not this pass.
2. **Full shell stubs.** Each new page is a real chrome page (skip-link, `NAV`/`FOOTER`
   markers, `body.wire-shell`, theme-init) with a breadcrumb, a `wire-doc-header`
   (title + `Planned` status pill + one-line lead), and nothing else. No tabs, no pager.
3. **Manifest-driven generator.** A new `scripts/build-ia.mjs` reads `manifest.json`,
   (a) generates `partials/nav.html`, (b) creates any missing stub page, (c) derives the
   sync target list + current-page map, then runs the existing nav/footer/shell
   propagation. `nav.html` and the stubs are no longer hand-edited.

---

## Target top-level rail (8)

`Home` (link → `index.html`) · `Get started` (link → `get-started.html`, **new**) ·
`Foundations` · `Styles` (**new tier**) · `Components` · `Templates` · `Demo` ·
`Resources`.

Removed top-level sections: **Patterns** (→ Foundations ▸ *UX guidance*) and
**Experiences** (→ Templates ▸ *Advanced*). "Overview" is renamed "Home".

### Section contents (label → where it points)

Existing files keep their real path; **new** items are stubbed at the target path.

- **Foundations** (`foundations/`)
  - Flat: Principles → `docs/principles.html` · Accessibility → `docs/accessibility.html`
    · Layout → `docs/layout.html` · Responsive **(new)** · Density **(new)** ·
    Interaction states **(new)** · Content & voice → `docs/content.html` · Plain
    language **(new)** · Localization **(new)** · Formatting **(new)** · Imagery **(new)**
  - Group **UX guidance** (was Patterns): Wayfinding, Page composition, System feedback,
    Search & filter, Form design, Wizard, Empty/error/loading, Compare & save,
    Audience & personalization, Auth & entry, Alerts & emergencies, Consent & disclosure,
    Accessibility patterns — **all new stubs** under `foundations/ux-guidance/`.
    (Target marks the first three as existing, but no standalone files exist today —
    `patterns/` holds only an `index.html` — so they are created as stubs. The
    `patterns/index.html` overview is preserved on disk and is out of scope here.)
  - Group **Playbook**: Healthcare overview, Senior-friendly, Health literacy, Care-journey
    wayfinding, Higher-ed RFI & apply — **all new stubs** under `foundations/playbook/`.

- **Styles** (`styles/`, new section index stub)
  - Color & theming **(new)** · Typography → `docs/typography.html` · Iconography →
    `docs/iconography.html` · Shape & radius **(new)** · Elevation → `docs/elevation.html`
    · Motion → `docs/motion.html` · Tokens → `docs/tokens.html`

- **Components** (`components/`) — nine collapsible category groups. Existing components
  link to their current folder/doc; new ones stub at `components/<category>/<slug>/`.
  - Actions, Forms & inputs, Selection & status, Containment & overlays, Navigation,
    Sections, Content & display, Messaging & feedback, Utilities.
  - Existing anchors (no move this pass): Button → `components/buttons/`; Field/Search/
    Choice/Form layout → `components/{field,search,choice,form-layout}/`; Badge/Tag;
    Card → `components/cards/`; Accordion/Tabs/Modal/Drawer/Divider; Breadcrumb/
    Pagination/Top nav/Side nav/In-page nav; Callout/Quote/Timeline/Media/Lists/
    Citation list/Table; feedback components → `docs/feedback.html`; Hero/Two-column/
    Feature grid/Footer → `docs/heroes.html` / `docs/content-blocks.html` /
    `docs/footers.html`; Help bar/Phone link/Text size → `docs/research.html`.

- **Templates** (`templates/`) — two collapsible groups.
  - **Basic**: Landing → `templates/landing/`; Page shells → `docs/page-shells.html`;
    Section landing, Article detail, Listing, Profile, Contact & location, Form wizard,
    Error 404, Sitemap & search — **new stubs** under `templates/basic/`.
  - **Advanced** (absorbs Experiences): Find a doctor, Program finder, Content hub, Plan
    your visit, Faculty directory, Location finder, Events hub, Admissions & apply —
    **all new stubs** under `templates/advanced/`.

- **Demo** — two collapsible groups linking the `pages/` mocks (curated per target).
  - **Riverside (healthcare)**: hospital-homepage, -specialty, -research, -find-a-doctor,
    -provider, -patient-visitor *(target label "Plan your visit")*, -location,
    -patient-story, -measure. (All exist; renames are phase 2.)
  - **Northgate (higher-ed)**: university-homepage, -program *(exists)*, -faculty
    *(exists)*, -admissions **(new demo page stub)**.

- **Resources** (`resources/`)
  - Evidence model → `docs/research.html` · Validation → `docs/validation.html` ·
    Component status → `docs/component-status.html` · Utility classes → `docs/utilities.html`

---

## Second-level disclosure

Today a category is a static `<div class="wire-doc-nav__group">` with a
`<p class="wire-doc-nav__group-title">` label. It becomes a nested disclosure:

```html
<details class="wire-doc-nav__group">
  <summary class="wire-doc-nav__group-summary">Actions</summary>
  <ul class="wire-doc-nav__list" role="list"> … leaves … </ul>
</details>
```

Applied to: Components (9 groups), Templates (Basic/Advanced), Demo (Riverside/
Northgate), and — for visual consistency with the user's "same treatment for the grouped
sections" note — Foundations (UX guidance, Playbook). Flat foundation/style pages remain
a plain `<ul>` above the groups.

**Behavior**
- Collapsed by default. The group containing the current page is stamped `open` by the
  generator (re-activates the dormant `group` field already in `sync-nav.mjs`'s `CURRENT`).
- `css/components/doc-nav.css`: add `.wire-doc-nav__group-summary` (caret, hover,
  focus-visible, hit area), keep the tree-line on the leaf `<ul>` only, hide the native
  marker. Mirror the existing `__section-summary` styling one level in / lighter weight.
- `js/wire.js`:
  - `initNavSearch` currently treats groups as always-visible `<div>`s and toggles a
    separate `groups` array's `hidden`. Since groups are now `<details>`, fold them into
    the generic `details` handling (save/restore `open`, set `hidden` deepest-first); drop
    the special-case `groups` block.
  - The open/close height animation (`.wire-doc-nav details`) already covers nested
    details — verify nested animation doesn't double-jump; cap if needed.

---

## `manifest.json` changes (source of truth)

Add/extend, **without** removing the compose-facing catalog
(`templates.page_shells`, `templates.riverside_mocks`, `templates.northgate_mocks`) that
`CLAUDE.md`'s workflow depends on. One array per domain; a small ordering block ties them
into the rail.

- `nav_order` (**new**): ordered section descriptors —
  `{ id, label, ref?, kind: "link"|"section", source }` where `source` names the catalog
  array (or `"components-by-category"`) the generator reads for that section's items, and
  `ref` is the section index for sections whose label links to their own page.
- `category_order` (**new**): ordered list of `{ id, label }` for the nine component
  groups (drives group order + labels + collapse).
- `foundations` (**extend**): array of `{ id, label, ref, status, group? }` where
  `group ∈ {null, "ux-guidance", "playbook"}`. Existing thin entries replaced.
- `styles` (**new**): array of `{ id, label, ref, status }`.
- `components` (**extend**): every entry gains `label`; `category` re-mapped to the new
  nine (notably `layout`→`sections`, `affordances`→`utilities`); new components appended
  as thin `{ id, label, category, ref, status: "planned" }` (no `class`/`variants` yet —
  truthful for an unbuilt component).
- `templates.basic` / `templates.advanced` (**new**): arrays of
  `{ id, label, ref, status }`.
- `demo` (**new**): `{ riverside: [...], northgate: [...] }`, each
  `{ id, label, ref }` over `pages/`.
- `resources` (**extend**): array of `{ id, label, ref, status }`.
- `category_taxonomy.values` (**update**): `foundation, actions, forms, selection,
  containment, navigation, sections, content, feedback, utilities, doc-chrome` + the note.
- `get_started` (**new**): `{ ref: "get-started.html", status: "planned" }`.

Each leaf carries `status`; `status === "planned"` (or "a local `.html`/folder that does
not yet exist") tells the generator to stub it.

---

## `scripts/build-ia.mjs` (the generator)

Pure dev-time, no runtime dependency. Steps:

1. **Read** `manifest.json`.
2. **Build the rail model** from `nav_order` + `category_order` + the domain arrays →
   an ordered tree of sections → (flat lists | groups) → leaves `{ label, ref, status }`.
3. **Emit `partials/nav.html`**: the static wrapper (topnav, search box, close button,
   theme switcher, backdrop, the leading comment) is a template constant; the rail body is
   generated from the model. Sections use `wire-doc-nav__section`; sections whose label
   links to an index use the `__section-link` anchor form; groups use the new
   `__group`/`__group-summary` disclosure; leaves use `wire-doc-nav__link`. Hrefs use the
   `{{base}}` token (unchanged contract for the propagation step).
4. **Stub missing pages**: for each leaf whose `ref` is a local page that doesn't exist on
   disk, write the shell-stub template (markers + `wire-doc-header` with `Planned` pill +
   breadcrumb derived from the section/group). Section index pages (`foundations/`,
   `styles/`, `components/`, `templates/`, `resources/`, `get-started.html`) get a stub if
   missing too.
5. **Derive the sync maps**: `targetList` = every chrome page on disk after stubbing
   (the union of leaf refs that are local html + section indexes + all existing
   `docs/*.html`); `CURRENT[rel]` = `{ section, group?, href }` from the leaf's position in
   the model (replaces the two hand-maintained tables in `sync-nav.mjs`).
6. **Propagate**: run the existing nav/footer/shell/theme-init fill from `sync-nav.mjs`
   over `targetList`, plus stamp current section **and** current group `open`.

`sync-nav.mjs` is refactored so its propagation core is importable by `build-ia.mjs`
(or `build-ia.mjs` subsumes it and `sync-nav.mjs` calls it). The hand-maintained
`targetList()` and `CURRENT` constants are removed.

---

## Out of scope (explicit)

- Physically moving/renaming existing component folders or `docs/*.html` pages to the
  clean target paths (**phase 2**).
- Real content for stubs (tabs, specs, accessibility, pager) — stubs say "Planned".
- Deleting demo pages the target omits (appointment, booking, login, portal, settings,
  medication, trial) or the legacy `patterns/`/`experiences/` index pages — left on disk.
- Reworking section **landing** pages (`components/index.html`, etc.) beyond ensuring they
  exist; their card grids reconcile in a follow-up.

---

## Verification

- `node scripts/build-ia.mjs` runs clean; reports counts (sections, stubs created, pages
  synced).
- No dead links: every rail `href` resolves to a file on disk.
- Existing component pages (e.g. `components/search/`) still render with correct
  current-section + current-group `open`, intact pager, no inline styles.
- Re-run is idempotent (second run = 0 changes).
- Spot-check in the Preview browser: rail two-level expand/collapse, search filter opens
  matching groups, current-page stamping, dark mode, mobile drawer.
- Token discipline + one-`h1` gates from `HANDOFF.md` pass on new stubs.
