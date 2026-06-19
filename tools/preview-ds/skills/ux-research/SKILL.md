---
name: ux-research
description: Research UX best practices and gather evidence for a Preview Design System component or design decision, landing findings in the citations.json evidence model. Use when a component needs cited best-practice guidance, when a design decision is contested and needs evidence, or to draft candidate citations. Produces tiered, UNVERIFIED candidate citations plus a research brief shaped to feed preview-component-page. Triggers — research best practices, gather evidence, draft citations, or what the research says about a component or decision.
argument-hint: "[component-id or decision]"
---

# ux-research

You turn a research question into evidence the Preview system can defend in a client
room. The generic capability (search, fetch, verify) is not the point; landing findings
in this system's evidence model, honestly, is. Run from the repo root.

Read `EVIDENCE-MODEL.md` and `references/tiering-rubric.md` before tiering anything, and
`references/citation-schema.md` before writing to `citations.json`.

## Hard guardrails (the credibility engine)

- **Never invent a source, finding, or statistic.** A fabricated citation shown to a
  client is a credibility-extinction event.
- **Never set `verified`.** Every entry you write is `verified_date: null`,
  `verification: "UNVERIFIED — pending human review"`. Verification is a human pass.
- **Never over-tier.** A convention is not an empirical finding; a judgment is not a
  standard. Label each finding by the kind of evidence it actually rests on.

## Steps

1. **Reuse first.** Read `citations.json`. List entries whose `supports` already cover
   this component/decision. If existing citations answer it, stop and report them — do
   not research what is already cited. Research only the residual open questions. (This
   keeps the evidence store curated, not sprawling.)

2. **Fan out.** For the open questions, dispatch parallel research sub-agents (one per
   question) that search the web, fetch the real sources, and adversarially verify each
   claim against the source text. Require a resolvable URL and a real org/title for every
   finding. Discard anything you cannot source.

3. **Tier.** Assign each surviving finding a tier per `references/tiering-rubric.md`:
   `standard` / `empirical` / `convention` / `judgment`. When unsure between two tiers,
   choose the weaker.

4. **Draft citations.** Append each finding to the `citations` array in `citations.json`
   in the exact schema (`references/citation-schema.md`): real `source.url`, correct
   `tier`, `verified_date: null`, `verification: "UNVERIFIED — pending human review"`,
   `supports: [the component/decision ids]`. Use a kebab-case `id` prefixed by the org
   (e.g. `nng-...`, `baymard-...`, `wcag-...`).

5. **Report.** Return (a) a tight tiered brief mapped to the `preview-component-page`
   brief shape (overview, use cases, interaction patterns, design guidance, references),
   and (b) a verification queue: the ids you drafted, each with its source URL, for the
   human to verify and date.

Do not claim any drafted citation as confirmed. On the brief, mark every decision whose
only support is an UNVERIFIED draft as such.
