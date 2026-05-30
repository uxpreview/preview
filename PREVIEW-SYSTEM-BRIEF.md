# Preview Design System — Project Brief & Build Plan

> **What this document is.** The *why* and the *plan*. It orients you (Claude Code)
> to what we're building, where it stands, and where it's going, so you can help
> across sessions without re-litigating the concept each time.
>
> **Where it sits relative to the other files:**
> - `CLAUDE.md` — the operational rules. How to compose a page, the hard constraints, the validation checklist, the brief template. Read it before doing work.
> - `manifest.json` — the machine-readable inventory. Every component, variant, slot, template, and experience.
> - **This file** — the strategy, architecture, and roadmap. Read it to understand intent.
>
> **Read this carefully — current state vs. destination.** This brief describes the
> **end goal**: a generation system. The repo today is a strong *component library*
> (v1.1) — the right foundation, but it does not yet reflect the full vision. That gap
> is intentional and is what the roadmap (§10) bridges. So: **this brief is the north
> star; `manifest.json` and `CLAUDE.md` are accurate mirrors of what exists *right
> now*.** Do not invent components or experiences in the manifest to match this vision,
> and do not shrink this vision to match the current code. Build toward the destination;
> document only what's real.
>
> Audience for now: **a single user (me).** No team handoff yet, so optimize for my
> speed and for consistency across my own sessions — not governance ceremony. But
> don't over-bespoke things that would later block a handoff to a small team.

---

## 1. The vision

The Preview Design System is two things at once:

1. **A component library** — grayscale, tokens-first, mid-fidelity parts that look
   polished at a glance and stay neutral enough that clients react to *structure and
   content*, not color.
2. **A generation system** — the library plus the rules and context an agent needs
   to **compose project-specific functional prototypes from those parts, fast.**

The end state: I bring a per-project brief (often assembled from client context or a
PRD), and you produce a strong first-draft prototype in seconds — built only from the
system, but specific to *this* client. I then edit. The value is not removing the
designer; it's moving the designer from assembly to curation and editing.

The library spans the full ladder — from a primary button up to a complete
"find a doctor" directory experience, with **multiple variants of the larger
experiences** that I can choose from and customize.

## 2. The key reframe (read this before anything else)

We have a strong **component library**. We have *not* yet built the **generation
system** — and they are different artifacts. A good library is necessary but not
sufficient for reliable generation. The generation system is mostly **not more
components.** It is:

1. **A machine-readable manifest** (`manifest.json`) so you compose from a known
   inventory instead of remembering or hallucinating parts.
2. **A composition layer** — page *recipes* and first-class *experiences*, not just
   parts. The hard part of "find-a-doctor directory" is that it's a template +
   content model + interaction pattern, not a component.
3. **A persistent objective file** (`CLAUDE.md`) that separates the **constant**
   (the system) from the **variable** (the per-project brief).
4. **Enforcement** — a validation step you run on your own output so the
   "content-variation-not-style-override" principle survives autonomous generation
   instead of drifting into inline styles and invented tokens.

Everything in the roadmap below serves building out those four.

## 3. Current state (v1.1)

Foundations and conventions, already solid:
- **Grayscale only.** Hierarchy from weight, scale, and space — never hue.
- **Tokens first.** Every value in `tokens.css`; components reference, nothing hardcodes.
- **Plain HTML + CSS, no build step.** Open a file, it works. Portable to Figma Make,
  Claude artifacts, client handoff.
- **WCAG 2.2 AA.** Contrast tested, focus rings everywhere, targets ≥44px, reduced-motion respected.
- **Prefixed.** `wire-` for components, `u-` for utilities. No collisions when embedded.
- **Content variations, not style overrides.** Variants are constrained.

Inventory (see `manifest.json` for the verified list): tokens (grayscale ramp, type
scale, spacing, radii, borders, shadows, motion — all in `css/tokens.css`); typography,
buttons, badges, tags, dividers; the full form set; the navigation family (top nav,
mega menu, sidebar, in-page nav, mobile drawer with focus trap) plus breadcrumb and
pagination; cards (content/person/resource/stat); heroes (editorial/split/centered/stat);
the content-block set (feature grid, two-column, accordion, tabs, callout, quote,
timeline); media placeholders and gallery; lists (linked/definition/article); tables
(data/comparison); footers (compact/standard/expanded); and the healthcare/higher-ed
patterns (persistent help bar, phone link, text-size control, print stylesheet).

There is also a small **JS layer** (`js/wire.js`) that auto-initializes interactive
behaviors — tabs, accordion, mega menu, the mobile drawer — via `data-wire-*` hooks.
CSS is linked through a single `css/wire.css`; `css/tokens.css` is the only file with
raw values.

Proof: the system began with **four Riverside pressure-test mocks** — homepage, specialty,
research, find-a-doctor — built from the system only, no inline styles, no hardcoded
values. That set has since grown to **18 Riverside (healthcare) demo pages plus 3 Northgate
(higher-ed)**; nine Riverside archetypes are featured on the home page, and all 21 are
listed in the directory. "Riverside" is the anonymized rehabilitation-hospital demo.
Separately, the system ships documented **page shells** (landing, article, listing, detail)
as reusable scaffolds.

Naming is BEM-ish and consistent: `.wire-block__element`, `.wire-block--modifier`,
`.is-state`, `data-wire-*` for JS hooks, `.u-*` for utilities — lowercase, kebab-case.

An extension lane is already sketched but unbuilt: a `css/clients/<client>.css` overlay
that re-aliases semantic tokens (e.g. `--color-accent`, `--space-md`) and adds
client-scoped variants while leaving component selectors untouched. This is the intended
mechanism for client divergence — see §4.

## 4. Architecture — how the pieces fit

Keep the **core system clean**; let client work layer on top rather than fork-and-mutate.

```
/                       core system (the constant)
  index.html            component showcase
  css/
    wire.css            single stylesheet to link
    tokens.css          the ONLY file with raw values
    reset|base|layout|utilities.css
    components/         one file per component
    clients/<client>.css   per-client token re-alias + scoped variants (extension lane)
  js/wire.js            vanilla auto-init for tabs, drawer, mega menu, accordion
  docs/                 per-component docs + principles + tokens + research
  pages/                Riverside pressure-test mocks (verified markup to copy from)
  manifest.json         machine-readable inventory (mirrors current state)
  CLAUDE.md             operational rules + brief template
  PREVIEW-SYSTEM-BRIEF.md   this file

  projects/<client>/    per-project work (the variable) — never edit core to fit one project
    brief.md            the filled project brief
    <page-id>.html      generated pages
```

Two complementary layers of client divergence, so the core stays untouched:
- **Styling divergence** uses the documented `css/clients/<client>.css` overlay — re-alias
  semantic tokens, add scoped variants. Component selectors never change.
- **Composition divergence** lives in `projects/<client>/` — the filled brief plus the
  pages generated for that engagement.

A project, then, is *(optional client overlay) + composed pages from the brief.* Use the
overlay lane rather than inventing a parallel customization mechanism.

The split that matters: **the system is the constant, the brief is the variable.**
The constant is never re-typed; only the brief changes per engagement.

## 5. The composition model

Compose by level, lowest that fits:
**atom → molecule → organism → template → experience.**

- **Atoms / molecules / organisms** — the parts. Browse by category.
- **Templates** — full page types. Today: the page shells (landing, article, listing,
  detail) and the four Riverside mocks. Start here for a whole page.
- **Experiences** — directories and multi-step flows, first-class, **each with named
  variants and a recipe.** Start here for anything interaction- or IA-heavy.

Experiences are the tier that makes generation feel intentional instead of a plausible
pile of blocks. Example — `find-a-doctor-directory` variants:
- **filter-left** — large directory, many facets, power-browse.
- **search-first** — visitor arrives with a name or specialty in mind.
- **browse-by-specialty** — visitor doesn't know who they need; lead with programs.

Each variant is a real **IA decision**, never a style tweak. That distinction is the
governance rule for the whole system (see §8).

Every node carries six dimensions: its **level**, its **variants**, its **composability**,
its **states**, its **behaviors**, and — cross-cutting all of them — its **evidence**
(the *why*: the tier and citations that defend it). Evidence is a first-class dimension,
not an afterthought; see §9.

## 6. The generation workflow

1. **Brief first.** Fill the project brief (template in `CLAUDE.md`). Where possible,
   assemble it from the client hub/wiki in the Obsidian vault rather than typing it —
   **the vault is the context source, this system is the engine.** This is what makes
   "paired with background knowledge of the client" real.
2. **Match intent to a template or experience** in `manifest.json`. Don't start blank
   when a template/experience covers it.
3. **Pull verified markup** from `/pages` or `/docs`; don't reconstruct from memory.
4. **Fill content slots** from the brief's content model — specific, plausible content,
   never lorem ipsum. Realistic content is what makes a wireframe land with clients.
5. **Validate** against the checklist in `CLAUDE.md` and fix failures before handing back.
6. **Report** what you started from, which variants you chose and why, and anything you
   had to flag.

## 7. The IA / navigation redesign

Reorganize the system's own site **by level of composition**, so the nav becomes a
visible expression of the model in §5 — and a reasoning aid for both me and you.

Six top-level sections, each mapping to a part of the manifest:
- **Foundations** — principles, tokens, accessibility.
- **Components** — atoms + molecules, browsable by category.
- **Patterns** — organisms: heroes, content blocks, nav, footers (composed but page-agnostic).
- **Templates** — the nine full page types.
- **Experiences** — directories and flows, each with its variants. *(New tier — missing today.)*
- **Demo** — the Riverside end-to-end proof.

The payoff: any request resolves to "what level am I working at?" and the nav answers it.

## 8. Principles & guardrails (the discipline that makes or breaks this)

- **Curate, don't sprawl.** Every component or variant must earn its place by
  representing a *distinct decision*. The temptation is always to add; the discipline
  is to keep the system small and high-quality. A solo maintainer's sync cost is real.
- **Content variation, not style override.** Enforced, not just documented — that's
  what the validation step is for.
- **Be honest about the fidelity ceiling.** These are wireframes to mid-fi. Static
  HTML can only fake interaction (e.g. directory filtering) so far. Decide deliberately
  where wireframe fidelity stops and real prototyping (JS state, real data) begins.
  Don't let it creep into building a half-real app unless that's a chosen goal.
- **"In seconds" is the draft, not the deliverable.** A client-ready prototype still
  needs an editing pass. Don't let the speed framing set a timeline trap.
- **Don't over-bespoke.** Bespoke conventions make the system me-shaped. Fine for solo
  use, but keep the parts that would block a future small-team handoff reasonable.
- **The promote-pattern habit.** When I edit a generated page, the standing question is:
  *one-off project tweak, or a gap in the system?* If the same edit recurs across two+
  projects, promote it into the core. This is how the system compounds instead of
  stagnating. When you notice a likely candidate, flag it.

## 9. Evidence & research model

Design decisions in this system must be defensible with **evidence, not taste**, so that
in a client conversation we can validate a choice and carry credibility behind it.
Evidence is a **first-class, cross-cutting dimension** — the *why* every node carries
(see §5). `EVIDENCE-MODEL.md` is the canonical statement; this section is the summary.

**The governing principle: honesty is the credibility engine.** The fastest way to lose
a sharp client (or their analytics team) is to dress up convention or taste as "research
shows." One exposed overclaim taints every other claim we make. So the discipline is not
"cite more" — it is to **label every rationale by the kind of evidence it actually rests
on, and never present a weaker kind as a stronger one.** Over-labeling everything
"research" devalues the genuinely research-backed claims and erodes trust.

**The four tiers.** Every rationale is tagged with one, and treated accordingly:
- **standard** — binding specifications (WCAG 2.2, Section 508, ARIA APG). Citable, often
  legal weight. State it as a requirement.
- **empirical** — findings from studies (Nielsen Norman Group, Baymard, peer-reviewed
  HCI, eye-tracking). Citable, but always with context: sample, domain, and recency.
- **convention** — established laws/heuristics and design-system consensus (Gestalt,
  Fitts/Hick and the other Laws of UX, Material/Carbon, Bringhurst). Well-established
  practice, not "proven" in an RCT sense.
- **judgment** — our reasoned call, no external backing claimed. Said plainly; a
  well-reasoned judgment honestly labeled is more credible than one wearing a borrowed
  lab coat.

Rule: **never promote a claim to a higher tier than its evidence supports.** A convention
is not an empirical finding; a judgment is not a standard.

**Architecture: one store, referenced everywhere.** Mirroring the tokens pattern,
`citations.json` is the single source of evidence and everything references it by `id` —
no duplicated, drifting citations. Each manifest node carries a `rationale` field that
cites by id, used only where a decision is worth defending (clients question it, it's
non-obvious, or it carries accessibility/legal weight — never to footnote the existence
of a button). Citations carry provenance and a `verified_date`, because **research rots**:
studies get superseded, findings update, URLs move. `docs/research.html` is the
human-readable render of the same store.

**The hard rule: never invent a citation.** A fabricated source, finding, or statistic
shown to a client is a credibility-extinction event — the biggest risk of having an agent
in the loop. The store is **human-verified**: the agent may *draft* candidate citations
(each marked `UNVERIFIED — pending human review`) but never invents a source, never fills
a gap with a plausible-sounding study, and never sets `verified` on its own authority.
Same logic as not letting the system grade its own homework — the evidence it cites must
come from outside the system and be checkable by a human.

**The payoff: evidence as a generation output.** Because evidence is structured against
components, Claude Code can generate not just a prototype but a **design rationale sheet**
alongside it: each non-obvious decision, its tier and citation(s) with sources, and a
one-line "what this means for the client" in plain language. The prototype ships *with
its own defense* — that turns "research-backed" from a value into a deliverable.

**Why grayscale and evidence reinforce each other.** Removing color forces visual
hierarchy to come from weight, scale, proximity, and contrast — precisely the perceptual
mechanisms that Gestalt and contrast-sensitivity research describe. The system is, in
effect, a live demonstration of the principles it cites. "We work in grayscale *because*
hierarchy should come from these mechanisms, and here's the research" is a strong, honest
thing to say in a room.

## 10. Roadmap

**Phase 1 — Make the inventory trustworthy.**
Reconcile `manifest.json` `class` values against the real stylesheet; add a `file`
pointer per entry to verified markup so you copy rather than reconstruct.

**Phase 2 — IA redesign + Experiences tier.**
Rebuild the nav per §7. Stand up the Experiences section with the first one or two
experiences fully documented (variants + recipes), starting with `find-a-doctor-directory`.

**Phase 3 — Project scaffolding.**
Add `/new-project` and `/new-page` slash commands that copy the brief template,
scaffold `projects/<client>/`, and point at the manifest. Wire brief assembly to the
vault client hub.

**Phase 4 — Enforcement tooling.**
Make the validation checklist a command you run on generated output, reporting pass/fail
before I review.

**Phase 5 — First real run + loop.**
Run a live project (SRALab is the validation candidate). Then a 30-minute "did the
system hold?" retro → log gaps in the decisions log → promote the good ones → tag a version.

**Ongoing.**
Batch maintenance, never trickle. Curate over add. Tag versions on meaningful change.

## 11. Definition of done

A good generated output:
- uses only existing components/classes/tokens (nothing invented),
- is grayscale, token-driven, with no inline styles,
- reads as plausible for the specific client (real content, not filler),
- non-obvious decisions carry a correctly-tiered citation from `citations.json` — no
  invented, over-tiered, or unverified-as-fact claims,
- passes the validation checklist,
- opens standalone in a browser,
- comes with a short note on what was used and anything flagged.

"The system held" in a retro means: the project was built without needing new tokens or
new components — only new *content and composition*. Where it didn't hold, that's a
logged gap and a promote-or-discard decision, not a quiet workaround.
