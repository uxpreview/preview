# Component Migration Playbook

How we bring each component onto the canonical 3-tab page template
(`components/buttons/`, `components/accordion/` are the references) while checking
it against real UX, IA, accessibility, and visual-design practice. One component
per cycle, one approval gate.

This is a process doc, not runtime chrome. It encodes the loop, the decisions we
locked, and the order of work.

## The per-component cycle (one component, one gate)

**A. Ground-truth.** Read the component's CSS, its `manifest.json` entry, its JS
behavior in `js/wire.js`, real usages in `pages/`, and its current `citations.json`
links (`supports` arrays). Output: exactly what variants, states, slots, and
behaviors exist today. Do not reconstruct from memory.

**B. Best-practice pass (four lenses).** Measure the component against each lens and
record a finding plus its evidence:
- **UX** (NN/g, Laws of UX): interaction model, when-to / when-not, content rules.
- **IA**: naming, where it sits, related components, composability.
- **Accessibility**: the ARIA APG pattern for this component, the full keyboard
  contract, and the exact WCAG 2.2 SCs it must satisfy, vs what it actually does.
- **Visual**: states, spacing, hierarchy, grayscale-token use vs the system's
  conventions (Carbon / Material / Bringhurst as convention-tier references).

Output: the **target** that brings the component to best practice, and a **gap list**
where it currently falls short.

**C. Propose + GATE (the single checkpoint).** Bring the user: the page plan, the
variant/state target, the gap list split into *doc-only* vs *needs a component
change*, and the citations (existing + drafted, drafts marked unverified) with a
short "needs your verification" list. Wait for approval / trim / redirect.

**D. Build.** Author the page from the template. Make only approved component
changes (grayscale, tokens, scoped, no new components without sign-off). Reconcile
the `manifest.json` entry (`type` / `variants` / `states` / `related` / `composable`
/ `rationale`) and `citations.json`. Wire nav + landing + run `node scripts/sync-nav.mjs`.

**E. Verify + deploy.** Run the checklist below. Review locally (screenshots), then
push only on the user's explicit go, and confirm the Pages build.

## Locked decisions

1. **Granularity — group tight families.** One page per standalone component, but
   tightly-related atoms share a page (e.g. one Forms page covers field, input,
   select, checkbox, radio, toggle). Apply the same to other tight families
   (feedback, nav) as we reach them.
2. **Gaps — fix small, surface big.** Fix small, safe, token-only gaps (focus ring,
   target-size bump) in the same cycle. Surface larger or riskier changes at the
   gate for the user's call. Default otherwise is document-as-is; no gold-plating.
3. **Sequence — atoms then organisms** (see Order of work).

## Order of work

- **Wave 1 — atoms** (light, inline cycle): Badge, Tag, Divider. (Typography reads
  as a Foundation, not an atom; handle it in the Foundations tier or last.)
- **Wave 2 — interactive organisms** (full APG + a11y, workflow-assisted): Tabs,
  Modal, Drawer, Mega menu, Toast, Stepper, Tooltip.
- **Wave 3 — molecules / grouped families**: Forms (one grouped page), Cards, Lists,
  Tables, Media, Callout, Quote, Timeline, Breadcrumb, Pagination, Hero, Banner,
  Empty-state, Skeleton, Help-bar, Text-size-control.

## Pragmatism

- Effort scales with complexity. Atoms get a light pass; organisms get the full
  APG + a11y treatment. Same page shape, dialed depth.
- `citations.json` is the evidence library. Map to citations that exist; draft new
  ones only for genuinely new decisions, always marked unverified for a human pass.
  Cite recurring facts (focus ring, target size) once and reuse.
- Heavy components: fan out research + adversarial QA as a parallel workflow.
  Atoms: inline.

## Page template (what every component page carries)

Page chrome: breadcrumb, masthead (eyebrow `Component · <category>`, name, status
pill, lead, source-file meta), three tabs, per-tab "on this page" TOC, doc-pager.
- **Usage**: Live demo, Testing status, Overview (when-to / when-not), Anatomy
  (+ BEM), Types & variants, **Behaviors** (States + Interactions: Mouse / Keyboard,
  with cross-tab pointers), Composability, In context, Do / Don't, Content
  guidelines, Composition patterns, Related, References.
- **Specs**: Tokens used, Measurements & structure, **States** (visual matrix),
  **JavaScript** (the `data-wire-*` hooks; say plainly if there are none), Code.
- **Accessibility**: ARIA & semantics, Keyboard interactions, WCAG 2.2 criteria
  mapped, Screen reader notes.

Behaviors layering follows Carbon: Usage carries the functional/narrative version
and cross-links; Specs holds the visual states + code; Accessibility holds the full
contract. A section that genuinely does not apply is omitted explicitly, never
reordered.

## Verification checklist (run before declaring done)

- Tabs switch; all three per-tab TOCs resolve within their panel; cross-tab links
  switch tabs; scroll-spy tracks; sticky TOC clears the tab strip.
- Live demo exercises the real component, including any stateful JS behavior.
- Responsive: zero horizontal overflow at 768 and 390; TOC hidden below 80em; rail
  off-canvas on phone.
- A11y: visible focus, targets >=44px (or honest AA/AAA framing), labels, contrast,
  APG conformance for the pattern.
- Compliance: grayscale only, tokens only, no hex, no inline styles, every class
  exists, no duplicate ids; console clean (favicon 404 aside).
- Evidence: every cited id exists in `citations.json`, tier-labeled and not
  over-tiered; unverified citations marked; no claim the page's own specs disprove.
- Nav: component in the rail (synced across pages) and current-stamped; landing
  card linked with the right status.
