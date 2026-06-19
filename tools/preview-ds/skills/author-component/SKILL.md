---
name: author-component
description: Orchestrate the full Preview component-authoring pipeline end to end — research, build, wire, review, validate — stopping at the two human gates the system requires. Use to promote a Planned component stub into a finished Usage/Specs/Accessibility page with evidence. Trigger via /author-component <component-id>, or on requests to fully build out / author a component.
argument-hint: [component-id]
---

# author-component

The orchestrator. Runs the mechanical 80% of authoring a component and stops cleanly at
the two gates that must stay human. Run from the repo root. `$ARGUMENTS` is the component
id (a `planned` or `beta` entry in `manifest.json`).

## Pipeline

1. **Resolve.** Confirm `$ARGUMENTS` is a real `components[]` entry in `manifest.json` and
   is `planned` or `beta`. If it is already `stable`, stop and say so. Read its `class`,
   `variants`, `file`, and any existing `rationale`.

2. **Research.** Invoke the `ux-research` skill for this component. It reuse-checks
   `citations.json`, researches the gaps, and appends tiered UNVERIFIED candidate
   citations, returning a brief + a verification queue.

3. **GATE 1 — approval checkpoint (human).** Present, then stop for sign-off: the target
   (what the finished page will cover), the gaps split into doc-only vs component changes,
   and the list of UNVERIFIED citations drafted. Do not proceed until the user approves.

4. **Build.** Invoke `preview-component-page` to build the Usage/Specs/Accessibility page
   from the brief and wire the `manifest.json` entry (status, class, variants, slots,
   behaviors, rationale).

5. **Regenerate IA.** Run `node scripts/build-ia.mjs` so nav, stubs, and landings reflect
   the new page.

6. **Review (parallel).** Dispatch the `manifest-integrity` and `citation-auditor`
   sub-agents together. Collect both worklists.

7. **Validate.** Invoke the `validate` skill on the new page. Fix house-style, contrast,
   link, and axe failures before continuing. (The house-style hook also fires on each
   write, so most drift is caught in-loop.)

8. **GATE 2 — citation verification (human).** Surface the UNVERIFIED queue for the user
   to verify and set `verified_date`. Do not set `verified` yourself.

9. **Summary.** Report what was built, which variants were chosen and why, any
   integrity/citation worklist items still open, and the citations pending verification.
   Leave commit/PR to the user.

## Rules

- Stop fully at Gate 1 and Gate 2. "Mostly automatic" means the gates are real, not
  skipped.
- Compose only from existing parts; if the component needs a token or part that does not
  exist, flag it as a system gap rather than inventing it.
- Never mark a citation verified.
