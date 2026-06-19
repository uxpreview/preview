---
name: validate
description: Run the Preview Design System validation gate on a page or page set before it ships — house style, token contrast, internal links, the WCAG axe gate, and the judgment items the CLAUDE.md checklist requires. Use before handing back generated or edited pages, or on request via /validate. Reports located pass/fail; does not fix.
argument-hint: [path-or-glob]
allowed-tools: Bash, Read, Grep, Glob
---

# validate

The on-demand gate. Evidence before "done." Run from the repo root over the target pages
(`$ARGUMENTS`, default: the pages changed this session). Report located pass/fail; do not
fix — surface the failures for the author to address.

## Run, in order

1. **House style** (per target `.html`/`.css` file):
   `node tools/preview-ds/scripts/house-style.mjs <file>` — exits non-zero with located
   violations (inline color, raw color literals, doc-chrome on a client page).

2. **Token contrast** (whole-system; tokens are global):
   `node tools/preview-ds/scripts/token-contrast.mjs css/tokens.css` — every pairing must
   clear its floor.

3. **Internal links** (whole-system):
   `node tools/preview-ds/scripts/link-check.mjs "$(pwd)"` — zero broken.

4. **Accessibility (axe):** run the gate on the target URLs. For a small set, point pa11y
   at just those pages (`npx pa11y <url>` each); for a full pass, `npm run a11y`. Must
   pass WCAG 2.2 AA.

5. **Judgment items** (the checklist a script cannot do — read each target page):
   - still grayscale, token-only, no `style=` with raw values;
   - every input has a label; visible focus; targets ≥44px;
   - interactive components carry their `data-wire-*` hook and the page links `js/wire.js`;
   - content is project-specific, not placeholder filler;
   - every cited id exists in `citations.json`; nothing unverified presented as fact.

6. **Optional deeper a11y:** for a release or a flagged page, invoke the installed
   `design:accessibility-review` for a manual keyboard / screen-reader pass — the gap the
   automated axe gate does not cover (`docs/validation.html`).

## Output

A pass/fail line per check, then a located worklist of every failure
(`file:locus — what failed — the fix`). If everything passes, say so plainly with the
counts (pages, links, contrast pairings). Never claim a page is valid without having run
checks 1–4 and read the page for 5.
