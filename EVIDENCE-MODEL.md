# Evidence & Research Model — Preview Design System

> **Purpose.** Design decisions in this system must be defensible with evidence, not
> taste, so that in a client conversation we can validate a choice and carry credibility
> behind it. This document is the canonical statement of how that works. It is a
> **first-class, cross-cutting dimension** — the sixth dimension every node carries,
> alongside level, variants, composability, states, and behaviors. It is the *why*.
>
> **For Claude Code:** read this in full, then persist it into the planning files —
> a new evidence section in `PREVIEW-SYSTEM-BRIEF.md`, the operational rules in
> `CLAUDE.md`, the `rationale` field in `manifest.json` — and create `citations.json`.
> Show what changed for review. Do not summarize away the nuance below; the nuance is
> the point.

---

## 1. The governing principle: honesty is the credibility engine

The fastest way to lose a sharp client — or their analytics team — is to dress up
convention or taste as "research shows." A claim that's mistier than its label invites
pushback we can't defend, and one exposed overclaim taints every other claim we make.

So the discipline is not "cite more." It is **label every rationale by the kind of
evidence it actually rests on, and never present a weaker kind as a stronger one.** That
labeling is what makes the genuinely research-backed claims land. Over-labeling
everything "research" devalues the real evidence and erodes trust. Honesty about what is
*convention* versus what is *evidence* (which `docs/research.html` already does) is the
single most important habit here — keep it and make it pervasive.

## 2. The four evidence tiers

Every rationale is tagged with one tier, and treated accordingly:

- **standard** — binding specifications. WCAG 2.2 success criteria, Section 508.
  Citable, not debatable, often carries legal weight. State it as a requirement.
- **empirical** — findings from studies. Nielsen Norman Group research, Baymard
  Institute, peer-reviewed HCI (CHI/TOCHI), eye-tracking. Citable, but always with
  context: sample, domain, and recency matter. Don't over-generalize a single study.
- **convention** — established laws and heuristics. Gestalt principles, Fitts's law,
  Hick's law, serial-position and von Restorff effects, F/Z-pattern scanning, Nielsen's
  heuristics. Principled and widely accepted, but not "proven" in an RCT sense. Present
  as well-established practice, not as measured fact.
- **judgment** — our reasoned call. Defensible by principle, but no external backing is
  claimed. Say so plainly; a well-reasoned judgment honestly labeled is more credible
  than a judgment wearing a borrowed lab coat.

Rule: **never promote a claim to a higher tier than its evidence supports.** A
convention is not an empirical finding; a judgment is not a standard.

## 3. Architecture: one citation store, referenced everywhere

Mirror the tokens pattern. Just as `tokens.css` is the single source for values and
everything references it, **`citations.json` is the single source for evidence and
everything references it by ID.** No duplicated, drifting citations.

`citations.json` entry shape:

```
{
  "id": "wcag-2.5.8-target-size",
  "finding": "Minimum target size of 24x24 CSS px (AA); we hold 44px on primary controls.",
  "tier": "standard",
  "source": { "org": "W3C WAI", "title": "WCAG 2.2 SC 2.5.8 Target Size (Minimum)", "year": 2023, "url": "https://..." },
  "verified_date": "2026-05-29",
  "supports": ["button", "choice", "nav family touch targets"]
}
```

- `docs/research.html` becomes the **human-readable render** of `citations.json` — one
  source, two surfaces.
- Citations carry provenance and a `verified_date`, because **research rots**: studies
  get superseded, Baymard updates findings, URLs move. Recency is part of credibility.

In `manifest.json`, each component/template/experience gains a `rationale` field, used
only where a decision is worth defending:

```
"rationale": [
  { "decision": "44px primary target size", "citation_ids": ["wcag-2.5.8-target-size"] },
  { "decision": "card grouping via proximity + shared region", "citation_ids": ["gestalt-proximity", "gestalt-common-region"] }
]
```

## 4. The hard rule: never invent a citation

This is non-negotiable and is the biggest risk of having an agent in the loop. **A
fabricated source, finding, or statistic shown to a client is a credibility extinction
event.** So:

- The citation store is **human-verified**. The agent never invents a source or a
  finding, and never fills a gap with a plausible-sounding study.
- The agent **may draft candidate citations**, but each is marked
  `"UNVERIFIED — pending human review"` and may never present as fact until verified.
- Every verified citation links to a **real, checkable source.**

Same governance logic as not letting the system grade its own homework: the evidence the
system cites must come from outside the system and be checkable by a human.

## 5. The payoff: evidence as a generation output

This is the piece that directly serves the client conversation. Because evidence is
structured against components (manifest `rationale` → `citations.json`), Claude Code can
generate not just a prototype but a **design rationale sheet** alongside it.

The rationale sheet, per prototype:
- lists each **non-obvious decision** in the prototype,
- gives its **tier** and its **citation(s)** with sources,
- adds a one-line **"what this means for the client"** in plain language.

The result: the prototype ships *with its own defense* — walk into the room with the
mockup and the cited reasoning already assembled. That turns "research-backed" from a
value into a deliverable. Add this as a supported output in `CLAUDE.md`.

## 6. Curation: cite what matters, not everything

Selective and high-quality beats exhaustive — and over-citing actively dilutes the claims
that count. Cite a decision when it is:
- something **clients tend to question**,
- **non-obvious** or counterintuitive,
- or carries **accessibility / legal weight**.

Do not footnote the existence of a button. The goal is a small set of strong, defensible
citations on the decisions that come up in the room.

## 7. The canon to anchor on

Standardize on a tight, credible set rather than citing the open internet:
- **standard** — W3C WAI / WCAG 2.2, Section 508.
- **empirical** — Nielsen Norman Group, Baymard Institute, peer-reviewed HCI.
- **convention** — Laws of UX (Fitts, Hick, Jakob's, serial position, von Restorff,
  etc.), Gestalt principles, Nielsen's heuristics.
- **vertical (healthcare / higher-ed)** — NIA "Making Your Website Senior Friendly"
  (already used in v1.1), Section 508, plain-language guidelines, health-literacy
  research.

Label each by its true tier — Laws of UX and Gestalt are *convention*, not *empirical*,
even though they're rigorous and well-known.

## 8. Why grayscale and evidence reinforce each other

Worth carrying into client framing: the grayscale discipline and this evidence base are
not two separate commitments — they're the same one. Removing color forces visual
hierarchy to come from **weight, scale, proximity, and contrast** — which are precisely
the perceptual mechanisms that Gestalt and contrast-sensitivity research describe. So the
system is, in effect, a live demonstration of the principles it cites. "We work in
grayscale *because* hierarchy should come from these perceptual mechanisms, and here's
the research" is a strong, honest thing to say in a room.

## 9. How this lives in the files

- **`citations.json`** — new. The single verified source of evidence.
- **`manifest.json`** — add the `rationale` field per node where warranted.
- **`PREVIEW-SYSTEM-BRIEF.md`** — a new evidence-model section (the principle, the tiers,
  the architecture, the payoff), and add *evidence* as the sixth dimension every node
  carries.
- **`CLAUDE.md`** — the four-tier labeling rule, the no-invented-citations hard rule, and
  the design-rationale-sheet capability as a supported output.
- **`docs/research.html`** — keep as the human-readable render of `citations.json`.
