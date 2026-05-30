# CLAUDE.md — Preview Design System

You are working inside the **Preview Design System**: a grayscale, tokens-first
wireframe and mid-fidelity system for client work in healthcare and higher-ed.

This file is the **constant**. It does not change between projects. The only thing
that changes per engagement is the **project brief** (template at the bottom). Read
this file and `manifest.json` before doing anything; don't re-derive the system from
the source each session.

> **Current state vs. destination.** `PREVIEW-SYSTEM-BRIEF.md` describes the *end goal* —
> a generation system. Today this repo is a **component library + demo pages**, the
> foundation for that goal. `manifest.json` and this file are accurate mirrors of what
> exists **right now**. Compose from what's real; never invent parts to match the vision.

---

## The objective

Given (1) this system and (2) a project brief, **compose a project-specific
prototype from existing parts only.** The win is a strong first draft in seconds
that I then edit — not a finished deliverable, and not a from-scratch design.

A good output:
- uses only components/classes/tokens that already exist (see `manifest.json`),
- reads as plausible for *this* client (real-sounding content from the brief, never lorem ipsum),
- is a single page or small set of pages that open directly in a browser,
- passes the validation checklist below before you hand it back.

## The mental model

Compose by level, lowest that fits:
**atom → molecule → organism → template → experience.**
- Need a whole page type? Start from a **template** in `manifest.json` and adapt.
- Need a directory / multi-step flow? See the caveat below, then start from the
  closest demo page.
- Need to fill a slot? Grab a **component**.
Never start from a blank page when a template or demo already covers the intent.

**Templates in `manifest.json` come in two kinds:**
- `templates.page_shells` — four abstract recipes (landing, article, listing, detail),
  documented in `docs/page-shells.html`. Each lists its region order. Start here to
  understand the *spine* of a page type.
- `templates.riverside_mocks` (18 hospital pages) and `templates.northgate_mocks`
  (3 university pages) — concrete, verified demo markup. **Copy the closest one**; its
  `file` is the path, its `composed_of` lists the real components it uses.

**Experiences: not built yet.** The brief's Experiences tier (first-class directories
and flows with named variants + recipes) **does not exist in source today** — the brief
itself marks it "(New tier — missing today.)". Until it's built, treat a directory or
flow intent as a template: start from the closest demo (`hospital-find-a-doctor.html`
for a directory, `hospital-booking.html` / `hospital-appointment.html` for a stepper
flow, `hospital-patient-visitor.html` for a plan-your-visit page). Do not fabricate an
"experience" object or its variants.

## Hard constraints (do not violate)

- **Grayscale only.** Hierarchy from weight, scale, space — never hue.
- **Tokens only.** Every value references `css/tokens.css`. No hardcoded values.
- **No new tokens, no new components, no inline styles.** If something seems missing,
  say so and propose the closest existing part — don't invent.
- **Content variations, not style overrides.** Change copy and structure; never restyle.
- **Plain HTML + CSS, no build step.** The file must work opened directly. Link
  `css/wire.css` once. Add `js/wire.js` (defer) only when the page uses an interactive
  behavior (tabs, accordion, drawer, mega menu, modal, toast, in-page nav, text-size).
- **Prefixes:** components `wire-`, utilities `u-`, states `.is-*`, JS hooks `data-wire-*`.
- **WCAG 2.2 AA:** visible focus on everything, targets ≥44px, contrast holds,
  reduced-motion respected, labels on all inputs.
- **Older audiences:** keep larger text defaults and the help-bar / text-size /
  phone affordances available where appropriate (healthcare).
- **Don't use doc-chrome on client pages.** `wire-doc-*` and `wire-status-pill` are the
  system's own documentation-site furniture (`manifest.json` → `doc_chrome`), not
  wireframe parts.
- **Never invent a citation.** Any evidence shown to a client must exist, verified, in
  `citations.json`. You may *draft* a candidate citation only as
  `UNVERIFIED — pending human review`, and never present an unverified source, finding,
  or statistic as fact. A fabricated citation is a credibility-extinction event. You do
  not set a citation `verified` on your own authority.
- **Label every rationale by its true evidence tier** — `standard` / `empirical` /
  `convention` / `judgment` — and never present a weaker tier as a stronger one. A
  convention is not an empirical finding; a judgment is not a standard. Honesty about
  what is convention versus evidence is the credibility engine (see `EVIDENCE-MODEL.md`).

If a request can only be satisfied by breaking one of these, **stop and flag it**
rather than quietly working around it.

## How to work a request

1. Read `manifest.json`. Match the intent to a `page_shell` (for the spine) and the
   closest concrete demo in `riverside_mocks` / `northgate_mocks` (for markup to copy).
2. Pull verified markup from the referenced `file` in `pages/` (or `docs/<component>.html`
   for a single component). Copy real snippets — don't reconstruct from memory. Every
   component entry carries the exact `class`, `variants`, `elements`, `behaviors`, and
   `file`.
3. Fill content slots from the brief's content model. Make it specific and plausible.
4. Assemble. Reuse existing classes verbatim. Wire any interactive component with its
   documented `data-wire-*` hook and include `js/wire.js`.
5. Run the validation checklist. Fix anything that fails before responding.
6. In your reply, list: which shell + demo you started from, which variants you chose
   and why, and anything you had to flag.
7. If the work warrants it (or the brief asks), produce a **design rationale sheet**
   alongside the page(s) — see *Evidence & rationale* below.

## Evidence & rationale (the credibility engine)

Design decisions here must be defensible with evidence, not taste — so a choice can be
validated in a client room with cited reasoning behind it. Evidence is a first-class,
cross-cutting dimension every node carries. `EVIDENCE-MODEL.md` is the full model.

- **One store.** `citations.json` is the single source of evidence, mirroring the tokens
  pattern: everything references it by `id`. `docs/research.html` is its human-readable
  render. Don't duplicate a citation inline.
- **The four tiers.** `standard` (WCAG 2.2 / Section 508 / ARIA APG — state as a
  requirement) · `empirical` (NN/g, Baymard, Pew — cite with sample/domain/recency) ·
  `convention` (Gestalt, Laws of UX, Material/Carbon, Bringhurst — well-established
  practice, not measured fact) · `judgment` (our reasoned call, no external backing
  claimed; say so plainly). Never over-tier.
- **`rationale` in the manifest.** Curated nodes carry a `rationale` array citing
  `citations.json` by id. Cite what matters — decisions clients question, non-obvious
  choices, or accessibility/legal weight — not the existence of a button. Nodes without
  a `rationale` are still linked to evidence via each citation's `supports` array.
- **Drafting rule.** You may *draft* a candidate citation, but mark it
  `UNVERIFIED — pending human review` and never present it as fact. Setting a citation
  `verified` is a human pass, never yours.

### Supported output — the design rationale sheet

Because evidence is structured against components, you can ship a prototype *with its own
defense*. When the work warrants it (or the brief asks), emit a **design rationale sheet**
alongside the page(s):
- each **non-obvious decision** in the prototype,
- its **tier** and **citation(s)** with sources (pulled from `citations.json`),
- a one-line **"what this means for the client"** in plain language.

Any decision whose only support is an `UNVERIFIED` citation must say so on the sheet —
never dress an unverified or judgment-tier call up as confirmed research.

## Validation checklist (run on your own output before finishing)

- [ ] Every `class` used exists in `manifest.json` / the stylesheet. No invented classes.
- [ ] No hardcoded colors, sizes, or spacing. No hex values. No inline `style=`.
- [ ] No color introduced anywhere. Still grayscale.
- [ ] Every input has a label; interactive elements have visible focus.
- [ ] Targets ≥44px; no `outline: none` without a replacement.
- [ ] Interactive components carry their `data-wire-*` hook and the page links `js/wire.js`.
- [ ] No `wire-doc-*` / `wire-status-pill` (doc-chrome) on a client page.
- [ ] Content is project-specific, not placeholder filler.
- [ ] Any evidence claim is tagged with its tier and not over-tiered; every cited id exists in `citations.json`.
- [ ] No citation presented as fact unless it's verified in `citations.json`; drafts are marked `UNVERIFIED`.
- [ ] File opens standalone in a browser (no build, no missing local refs).

## Output conventions

- New project work goes in `projects/<client>/` — never edit the core system files
  to fit one project. The core stays clean; projects pull it in.
  (Note: `projects/` does not exist in the repo yet — you'll create it on first use.)
- Page files: `projects/<client>/<page-id>.html`.
- **Client divergence uses the existing extension lanes — don't invent a parallel one:**
  - *Styling:* a per-client token overlay loaded **after** `css/wire.css` that re-aliases
    semantic tokens only (no raw values, no new components). The shipped pattern is the
    example at `css/client-overlay.example.css` — copy and rename it (e.g.
    `css/clients/<client>.css`, the brief's intended home). Component selectors never change.
  - *Composition:* the generated pages in `projects/<client>/`.
- If a project edit recurs across two+ projects, note it as a **system gap** at the
  end of your reply so I can decide whether to promote it into the core (the
  promote-pattern habit). Flag it; don't quietly work around it.

---

## PROJECT BRIEF (the variable — fill per engagement)

```
Client:
One-line positioning:        # who they are, in their own voice
Audience:                    # primary visitors; note if older / accessibility-sensitive
Sector:                      # healthcare | higher-ed | other
Pages needed:                # e.g. homepage, find-a-doctor, specialty landing
Experiences needed:          # e.g. find-a-doctor-directory (variant: filter-left)
IA / nav:                    # top-level sections, hierarchy
Content model:               # entities + sample values (provider, condition, location, story, study, stat...)
Reference URLs:              # current site or comparators, for structure not style
Must-have patterns:          # anything non-negotiable
Out of scope:                # what NOT to build
```

> Tip: this brief can be assembled from the client hub/wiki in the vault rather than
> typed from scratch. The vault holds the context; this system is the engine.
>
> Note: the "Experiences needed" line stays in the template because the brief asks for
> it, but the Experiences tier isn't built yet (see "The mental model"). Until it is,
> map an experience request to the closest demo page and pick its layout by hand.
