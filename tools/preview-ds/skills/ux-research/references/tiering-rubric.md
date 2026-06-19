# Evidence tiering rubric

Every finding gets exactly one tier. Never present a weaker tier as a stronger one.
`EVIDENCE-MODEL.md` is the canonical statement; this is the quick decision aid.

| Tier | What qualifies | How to state it | Examples |
|------|----------------|-----------------|----------|
| `standard` | Binding specifications, often legal weight | As a requirement | WCAG 2.2, Section 508, ARIA APG |
| `empirical` | Findings from studies, with a method | With sample, domain, recency | Nielsen Norman Group, Baymard, peer-reviewed HCI, eye-tracking |
| `convention` | Established heuristics / design-system consensus | As well-established practice, not proven fact | Gestalt, Laws of UX (Fitts/Hick), Material, Carbon, Bringhurst |
| `judgment` | Our reasoned call, no external backing | Plainly, as our judgment | "We lead with programs because the audience arrives unsure who they need" |

## The one rule

Never promote a claim above the evidence it rests on. Common over-tiering to reject:

- An NN/g or Baymard article marked `standard` → it is `empirical`.
- A Gestalt / Laws-of-UX / Material / Carbon principle marked `empirical` → it is
  `convention` (well-established, not measured in an RCT).
- A reasoned design call marked `convention` → it is `judgment`. A well-reasoned
  judgment honestly labeled is more credible than one wearing a borrowed lab coat.

When a finding could sit in two tiers, choose the weaker. Over-labeling everything
"research" devalues the genuinely research-backed claims and erodes trust — honesty is
the credibility engine.
