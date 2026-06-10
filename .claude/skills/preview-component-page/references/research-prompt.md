# Component research prompt (for Claude research mode)

Give this to the user to run in Claude's research mode — **one component per run**.
Fill `{{COMPONENT}}` (and optionally `{{NOTES}}`) before sending. The output is a
structured Markdown brief with inline evidence-tier tags and a sources table that
maps directly onto a Preview component page. Paste the result back to build the page.

Copy everything inside the fence:

````text
ROLE & GOAL
You are a senior product designer and accessibility specialist conducting deep
research to document ONE user-interface component to a professional design-system
standard. Your output will be implemented as a documentation page in the "Preview
Design System." Research thoroughly with authoritative, current sources; then
synthesize into ready-to-adapt page content backed by cited evidence.

COMPONENT TO RESEARCH: {{COMPONENT}}
OPTIONAL CONTEXT: {{NOTES — e.g. how it must differ from sibling components,
specific use cases, anything to include or avoid. Leave blank if none.}}

ABOUT THE DESIGN SYSTEM (this shapes everything you output)
- Preview is a GRAYSCALE, tokens-first, mid-fidelity WIREFRAME system for
  healthcare and higher-education websites.
- Audiences skew older and accessibility-sensitive (patients, families,
  prospective students). Optimize guidance for clarity, large touch targets,
  plain language, and robust accessibility.
- Grayscale only: hierarchy and status come from weight, size, space, icon, and
  position — NEVER hue. Whenever a source recommends color (red for errors, green
  for success, etc.), translate it into a grayscale-safe equivalent (icon + text
  + placement) and say so explicitly.
- WCAG 2.2 AA is the floor. Touch targets are 44×44px. Visible focus is required.
  prefers-reduced-motion is respected.
- Each component becomes ONE page with three tabs: Usage, Specs, Accessibility.
  Structure your output to fill those tabs (mapping is noted in each section).
- Do NOT write final HTML or CSS — it will be implemented with the system's own
  classes and tokens. Give structure, behavior, and copy — not code.

EVIDENCE MODEL — tag EVERY meaningful claim with exactly one tier, backed by a
real source:
- [standard]   Normative requirement: WCAG 2.2, WAI-ARIA Authoring Practices
               (APG), Section 508. State it as a requirement.
- [empirical]  Measured study with method/sample: Nielsen Norman Group, Baymard,
               Pew, peer-reviewed HCI. Note sample and recency.
- [convention] Well-established practice, not measured proof: Material 3, IBM
               Carbon, Apple HIG, GOV.UK, USWDS, Atlassian, Polaris, Primer,
               Gestalt / Laws of UX, Bringhurst.
- [judgment]   A reasoned call with no external backing — say so plainly.
Never over-tier: a convention is not empirical; a judgment is not a standard.

SOURCE RULES (hard constraints)
- Prefer the most authoritative and current sources. For accessibility: W3C APG
  / WCAG, WebAIM, Deque, MDN. For UX evidence: NN/g, Baymard, GOV.UK, USWDS. For
  older / health-literacy audiences: CDC & AHRQ health literacy, NIH/NIA
  senior-friendly guidance, HHS / Section 508.
- Every source must be a real, currently accessible page with a working URL the
  reader can open and verify. Include the publication or last-updated year when
  shown.
- Do NOT fabricate sources, statistics, quotes, or findings. If a claim can't be
  verified, mark it UNVERIFIED or omit it. Distinguish "sources say X" from
  "I infer Y." All citations are CANDIDATES for human verification — make them
  checkable.
- When sources conflict, name the disagreement, weigh it, and make a
  recommendation — do not silently average.

RESEARCH PROCESS
1. Establish the canonical definition and the WAI-ARIA APG pattern (if one exists)
   for {{COMPONENT}}.
2. Gather accessibility requirements: roles, accessible name, states, full
   keyboard interaction model, focus management, screen-reader behavior.
3. Gather UX best practices: purpose, variants, states, measured findings.
4. Compare 2–3 reference implementations from mature design systems; note where
   they agree and differ.
5. Layer in healthcare, older-audience, and plain-language considerations.
6. Identify common pitfalls and anti-patterns.
7. Synthesize into the OUTPUT below. Be exhaustive within scope; do not pad.

OUTPUT — return EXACTLY this Markdown. Fill every section with ready-to-adapt
content (real bullets, real copy, real table rows — not abstract advice). Tag
claims inline like "— [convention][Carbon]" or "— [standard][APG]; [empirical][NNG]"
where the bracketed key maps to the Sources table at the end.

# {{COMPONENT}} — Research Brief (Preview Design System)

## 0. Snapshot
- Definition (one sentence):
- Primary purpose:
- Closest siblings & how this differs:
- Consensus level (high / mixed / contested) + one line on the main disagreement:

## 1. When to use / when not to use   → Usage
- Use it when: (bullets, each tagged)
- Don't use it / use this instead: (bullets, each tagged)

## 2. Anatomy   → Usage
- Parts (name — role): …
- Recommended structure, described in words (no code):

## 3. Variants & options   → Usage
- (variant — when to use it, tagged)

## 4. States   → Specs
- For each: rest, hover, focus-visible, active, disabled, read-only, error,
  loading, empty (as applicable) — what changes AND its grayscale-safe cue.

## 5. Behavior & interaction   → Specs / Accessibility
- Interaction model, timing, edge cases (tagged)

## 6. Keyboard   → Accessibility
| Key | Action | Tier + source |
(one row per key per the APG pattern)

## 7. Accessibility   → Accessibility
- Role / ARIA (per APG):
- Accessible name / labeling:
- Focus management:
- Screen-reader announcements:
- Target size, contrast, reduced motion:
- Grayscale note (no color-only signals — WCAG 1.4.1):

## 8. Content & microcopy   → Usage
- Ready-to-use examples for label / placeholder / hint / error / empty, with a
  healthcare example AND a higher-ed example. (tagged)

## 9. Do / Don't   → Usage
- Do: … / Don't: …  (3–6 paired, final-copy sentences, tagged)

## 10. In context   → Usage
- Healthcare scenario (concrete):
- Higher-ed scenario (concrete):

## 11. Responsive & older-audience notes
- (bullets, tagged)

## 12. Pitfalls / anti-patterns
- (bullets, tagged)

## 13. Canonical markup intent   → Specs (Snippet)
- Plain-English description of the ideal markup/structure to implement (elements,
  nesting, attributes, ARIA) — NOT final HTML.

## Sources
| Key | Source (org — title) | Tier | URL | Year | What it backs |
| --- | --- | --- | --- | --- | --- |
(every key used inline must appear here, with a working URL)
````
