---
name: preview-component-page
description: >-
  Research-driven authoring of a Preview Design System component documentation
  page. Use this whenever building, filling, or documenting a component in the
  Preview design system (preview/components/<slug>/) — turning a research brief
  into a finished Usage/Specs/Accessibility page, promoting a "Planned" stub into
  a real page, or wiring a component into the rail and landing. Also use it to
  generate the reusable Claude research-mode prompt for a component. Trigger on
  mentions of: filling component stubs, building out components with best
  practices / evidence / citations, the component research prompt, or
  Preview/wire- component pages — even if the user doesn't name this skill.
---

# Preview component page

Turn per-component research into a finished, evidence-backed documentation page in
the Preview Design System, consistently across every component. The win is that
each page reads as professionally documented (anatomy, usage, specs, accessibility)
and every non-obvious claim is traceable to a real source at its correct evidence
tier — without reinventing the structure each time.

Read `preview/CLAUDE.md` and `preview/manifest.json` first; they are the system's
constants. This skill assumes that context and adds the repeatable workflow.

## The two phases

1. **Research** (the user runs it, in Claude research mode) — produces a structured
   brief for one component. You supply the prompt.
2. **Build** (you run it, in this repo) — turn the brief into the page, wire it in,
   verify.

They're decoupled on purpose: research mode has no repo access, and the build needs
the repo's exact classes/tokens/scaffold. Don't try to do the research yourself
inline unless the user asks — the point is to spend their research-mode credits on
deep, cited synthesis and have you do the precise implementation.

## Phase 1 — hand off the research prompt

The prompt lives in `references/research-prompt.md`. When the user wants to research
a component:

1. Read `references/research-prompt.md`.
2. Fill `{{COMPONENT}}` with the component (use the exact label from `manifest.json`,
   e.g. "Select", "Date picker", "Wait time") and `{{NOTES}}` with anything specific
   (how it must differ from siblings, must-have use cases). Pull the closest siblings
   from the component's category in `manifest.json` so the brief differentiates.
3. Give the user the filled prompt to paste into research mode, one component per run.
4. When they paste the brief back, go to Phase 2.

If the user instead pastes a brief straight away, skip to Phase 2 — the brief's
section headings are the contract you build against.

## Phase 2 — build the page from the brief

Work one component at a time. The detailed scaffold, the brief-section → page-section
map, the class cheatsheet, and the verification gates are in
`references/page-anatomy.md` — read it before building. The flow:

**1. Locate the component.** In `manifest.json`, find the component by id/label: its
`category`, `ref` (the page path), and current `status`. The stub already exists at
`ref`. Confirm the path before editing.

**2. Scaffold.** Clone the verified structure from `components/search/index.html`
(3 tabs: Usage / Specs / Accessibility, with `wire-tabs`, per-tab `wire-inpagenav`,
breadcrumb, `wire-doc-header`, `wire-doc-pager`). Replace the stub's `<main>` with
it. Leave the `NAV`/`FOOTER` marker regions untouched — `build-ia.mjs` owns them.

**3. Fill the tabs from the brief.** Map brief sections to page sections per
`references/page-anatomy.md`. Use the brief's draft copy, adapted to the system's
voice (plain, honest, no marketing — read existing pages and `docs/research.html`
for tone). Build live `doc-example` demos using the component's **real** `wire-`
classes from `manifest.json` (look up `class`/`variants`/`elements`; never invent a
class). Keep each tab's in-page-nav in sync with the section ids you include.

**4. Honor the hard constraints** (full list in `references/page-anatomy.md`):
grayscale only, tokens only, existing classes only, no inline styles, one `<h1>`,
WCAG 2.2 AA, ≥44px targets, decorative media `aria-hidden`. Translate any
color-based guidance from the brief into a grayscale-safe cue (icon + text +
position) — this is the system's defining constraint and the most common way an
imported best practice goes wrong here.

**5. Draft candidate citations — never fabricate, never self-verify.** For each
source in the brief's Sources table, draft a `citations.json` entry. Match the
existing schema in `preview/citations.json` (read it first). Critically:
- Match the existing `citations.json` schema exactly: each entry is
  `{ id, tier, finding, source: { org, title, year, url }, verified_date, verification, supports }`.
  Set `"verified_date": null` and `"verification": "UNVERIFIED — candidate from
  <component> research brief, pending human review"`, with `"supports": ["<id>"]`.
  You never fill `verified_date` — that's a human pass. A fabricated or overstated
  citation is a credibility-extinction event (see `CLAUDE.md` / `EVIDENCE-MODEL.md`).
  Reuse an existing citation id where the source already exists (grep `citations.json`
  first) instead of adding a duplicate.
- Keep the brief's evidence tier (`standard` / `empirical` / `convention` /
  `judgment`); never present a weaker tier as a stronger one, and never present an
  unverified source as fact in the page copy.
- Where a decision on the page warrants it (something a client would question, an
  accessibility/legal point, a non-obvious call), add a `rationale` entry citing
  the relevant citation ids — don't cite the existence of a button.
- Surface the candidate citations to the user as a separate list so they can verify
  and flip them to `verified` themselves.

**6. Wire the manifest.** In `manifest.json`, set the component's `status` off
`"planned"` to its real status (usually `"beta"` for a freshly documented page; the
team promotes to `"stable"` after the SR audit). Drop `status: "planned"` from its
nav leaf too, and add a `desc` (one line, from brief §0) if missing — that's what
the generated Components landing card shows. Add `class`/`variants`/`slots`/
`behaviors` if now known.

**7. Regenerate + verify.** Run `node scripts/build-ia.mjs` (re-syncs nav/footer,
flips the landing card from "Planned" to the real status, stamps current). Then run
the verification gates in `references/page-anatomy.md` and check in the browser with
the preview tools: tabs switch + hash deep-link, in-page-nav scroll-spy tracks,
pager neighbors are right, no console errors, dark-mode spot check.

**8. Report.** Tell the user: which component shipped, the candidate citations to
verify (with tiers + URLs), anything from the brief you couldn't honor in grayscale
or had to down-tier, and any system gap you hit (a missing token/variant) — flag it,
don't quietly work around it.

## Anti-patterns

- **Building from memory of another page.** Always clone the current
  `components/search/index.html` — the scaffold evolves.
- **Inventing classes to match the brief.** If the brief implies a part the system
  lacks, say so and use the closest existing class, or flag the gap. No new CSS in a
  page.
- **Importing color semantics.** "Red for error" must become an icon + text + a
  consistent position. Re-check every status cue.
- **Over-claiming evidence.** Don't promote convention to empirical, or present an
  unverified candidate as established fact. Honesty about tier is the credibility
  engine.
- **Hand-editing the rail or `partials/nav.html`.** The nav is generated from
  `manifest.json` by `build-ia.mjs`; edit the manifest and re-run.

## Bundled resources

- `references/research-prompt.md` — the research-mode prompt to hand the user.
- `references/page-anatomy.md` — scaffold, brief→page section map, class cheatsheet,
  constraints, verification gates. Read before building.
