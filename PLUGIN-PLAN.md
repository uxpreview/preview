# Preview DS Plugin — Build Spec

> **Status: built.** Implemented under `tools/preview-ds/` (plugin.json, two hook scripts,
> `token-contrast.mjs`, `link-check.mjs`, the `preview-component-page` / `ux-research` /
> `validate` / `author-component` skills, and the `manifest-integrity` / `citation-auditor`
> agents). Changes from this draft during the build: added the two custom checks
> (`token-contrast.mjs`, `link-check.mjs`); the house-style HTML check flags color only
> inside inline `style=` attributes, because token-valued inline styles (`style="--grid-min:
> 16rem"`) and hex shown as text on the token docs pages are legitimate. The old
> `.claude/skills/preview-component-page/` copy is left in place until install cutover.
>
> The build plan for `preview-ds`, a Claude Code plugin that packages the design
> system's authoring, evidence, and enforcement workflow into one versioned, installable
> bundle. This is the *tooling* layer. It operates on the system (manifest.json,
> citations.json, css/, pages/); it does not contain the system.

## Why a plugin (and what it actually buys you)

A plugin does not make the workflow automatic. Hooks, auto-invoked skills, and an
orchestrator do that. The plugin is the packaging: one versioned unit you install once,
that travels to another machine or a teammate and stays consistent. It is justified here
because the design system is the constant reused across many client engagements and is
headed for eventual small-team handoff (per `PREVIEW-SYSTEM-BRIEF.md`). The tooling for
that constant should version and travel with it.

"Mostly automatic" is the right phrase, not "fully." Two gates stay human by your own
rules: the migration playbook's single approval checkpoint, and citation verification.
The plugin automates the mechanical work between them and stops cleanly at each.

## Layout

The plugin source lives in-repo so it versions with the system:

```
preview/
  tools/preview-ds/
    .claude-plugin/
      plugin.json
    skills/
      preview-component-page/        # MOVED from .claude/skills/ (existing)
        SKILL.md
        references/{page-anatomy.md, research-prompt.md}
      ux-research/
        SKILL.md
        references/{tiering-rubric.md, citation-schema.md}
      validate/
        SKILL.md
      author-component/               # orchestrator
        SKILL.md
    agents/
      manifest-integrity.md
      citation-auditor.md
    hooks/
      hooks.json
    scripts/
      house-style.mjs                 # shared by the hook AND the validate skill
      guard-generated.mjs
    README.md
```

`plugin.json` (components auto-discovered from `skills/`, `agents/`, `hooks/hooks.json`):

```json
{
  "name": "preview-ds",
  "displayName": "Preview Design System",
  "description": "Authoring, evidence, and enforcement workflow for the Preview grayscale design system.",
  "version": "0.1.0",
  "author": { "name": "Ryan McCarty" }
}
```

## Component contracts

### Hooks (deterministic guards — build first)

`hooks/hooks.json` declares two. Both reference bundled scripts via `${CLAUDE_PLUGIN_ROOT}`
and read the target path from the tool-call JSON on stdin.

**House-style (PostToolUse, matcher `Write|Edit`)** runs `scripts/house-style.mjs` on the
written file. It enforces the deterministic half of the `CLAUDE.md` checklist, scoped tight
to stay false-positive-free:
- only acts on `*.html` / `*.css`;
- flags inline `style=` in HTML;
- flags hex / `rgb(` / `hsl(` color literals, allowlisting `css/tokens.css` and
  `css/clients/*.css` where raw values legitimately live;
- flags `wire-doc-*` or `wire-status-pill` appearing in any `projects/**` client page
  (doc-chrome leaking onto a client page).
On a violation it prints the located issues and exits 2, so the fix happens in-loop, not at
review. Must run fast (<100ms); that is why it is scoped to two extensions.

**Generated-file guard (PreToolUse, matcher `Write|Edit`)** runs `scripts/guard-generated.mjs`,
which denies edits to generated artifacts (`partials/nav.html`, `dist/wire.bundle.css`) with
a message pointing at the real source (`manifest.json` + `node scripts/build-ia.mjs`, or
`npm run bundle`). Emits `permissionDecision: "deny"`. The file header already says "Do NOT
hand-edit"; this enforces it.

### Skills

**`ux-research`** — the evidence-model adapter. The generic capability (fan-out search,
fetch, adversarially verify) is solved; the value is landing findings in your model honestly.
Steps:
1. Input: a component id or a contested decision.
2. Reuse-check `citations.json` for entries whose `supports` already cover it; research only
   the residual gaps. (Stops the evidence store from sprawling.)
3. Fan out research sub-agents on the open questions; verify each claim against its real source.
4. Tier each finding per `references/tiering-rubric.md` (standard / empirical / convention /
   judgment); never over-tier.
5. Append candidate citations to `citations.json` in the exact schema
   (`references/citation-schema.md`): real resolvable URL, correct `tier`, `verified_date: null`,
   marked `UNVERIFIED — pending human review`, `supports: [ids]`. Never sets verified; never
   invents a source.
6. Output: a tiered brief shaped to feed `preview-component-page` directly, plus a verification
   queue.

**`validate`** — the on-demand gate (`/validate [path-glob]`, also model-invocable so the
orchestrator can call it). Runs `scripts/house-style.mjs` across the target pages (same script
the hook uses, one source of truth), then `npm run a11y` on those URLs, then the judgment items
a grep cannot do (grayscale/token-only, `data-wire-*` hooks + `js/wire.js` present for
interactive components, content is project-specific). Reports located pass/fail; does not fix.

**`preview-component-page`** — existing, moved into the plugin unchanged for now. Fold its two
open observations (scope CSS edits by rule-declaration not class usage; verify the canonical
source loads before deleting a fallback) into it as pre-flight checks during the build, and make
the manifest + citation + nav wiring an explicit closing checklist.

**`author-component`** — the orchestrator (`/author-component [component-id]`), the
"mostly automatic" centerpiece:
1. Resolve the id against `manifest.json` (must be a planned/beta entry).
2. `ux-research` → tiered brief + UNVERIFIED citations.
3. **Human gate 1 — approval checkpoint** (playbook gate C): present target, gaps split
   doc-only vs component-change, and the unverified citations. Stop for sign-off.
4. `preview-component-page` → build the Usage/Specs/A11y page; wire the manifest entry.
5. `node scripts/build-ia.mjs` → nav, stubs, landings.
6. `manifest-integrity` + `citation-auditor` in parallel → consistency + evidence review.
7. `validate` → a11y gate + checklist.
8. **Human gate 2 — citation verification**: surface the UNVERIFIED queue for you to verify and
   set `verified_date`. Stop.
9. Summarize what was built, variants chosen and why, gaps flagged, citations pending. Commit/PR
   stays manual.

### Subagents (parallel reviewers, read-only)

**`manifest-integrity.md`** (tools: Read, Grep, Glob, Bash) — audits the consistency the system
rests on: every `components[].file`/`ref` resolves on disk; every `class` token exists in the
CSS; nav leaf ids map to real manifest ids; `status` values valid; no orphaned stubs or ghost
entries; rationale citation ids exist. Returns a located defect list, no fixes. This is the
manifest schema-validation gap, as an on-demand reviewer instead of CI.

**`citation-auditor.md`** (tools: Read, Grep, Bash, WebFetch) — audits `citations.json` against
the four tiers: the UNVERIFIED queue, anything cited as fact with a null `verified_date`, source
URLs that no longer resolve, likely over-tiering, citations with no `supports`. Returns a
verification worklist. Read-only; never sets verified.

(Plugin agents ignore `hooks`/`mcpServers` fields for security; neither agent needs them.)

## Install and dev loop

- Dev iteration: `claude --plugin-dir tools/preview-ds`.
- Installed use: a `marketplace.json` at repo root pointing at `tools/preview-ds`, then
  `claude plugin marketplace add .` and `claude plugin install preview-ds@preview`.
- Skill `SKILL.md` edits take effect live. Hook, agent, and manifest changes need
  `/reload-plugins` or a session restart.
- Validate structure with `claude plugin validate tools/preview-ds`.
- Note the migration: moving `preview-component-page` out of `.claude/skills/` into the plugin
  means it loads only when the plugin is installed. One-time install replaces the auto-load.

## Build sequence (by protection value)

1. **Enforcement core**: plugin skeleton (`plugin.json`), `house-style.mjs`, `guard-generated.mjs`,
   `hooks.json`; move `preview-component-page` in. Immediate guardrails.
2. **`manifest-integrity`** agent. The integrity net under everything else.
3. **Evidence pipeline**: `ux-research` skill (+ tiering-rubric, citation-schema refs) and the
   `citation-auditor` agent.
4. **`validate`** skill, reusing `house-style.mjs`.
5. **`author-component`** orchestrator. Ties the parts together once each is proven.

Each step is independently useful; stop at any point and what exists still earns its place.

## Deliberately deferred (not in v1)

- `/new-project` and `/new-page` scaffolding commands (roadmap Phase 3). Add once the
  authoring loop is solid and you actually start an engagement.
- GitHub Actions CI. Add a one-file a11y workflow the day a second contributor appears.
- Playwright visual-regression baselines. A separate track; valuable but not part of this bundle.
- Bundled MCP servers. None of your stack needs one yet.

## Open questions to settle before building

- Plugin home: `tools/preview-ds/` in-repo (recommended, versions with the system) vs a separate
  repo (cleaner separation, more overhead). Spec assumes in-repo.
- Does `house-style.mjs` block (exit 2) or warn (exit 0 + message) on violation? Spec assumes
  block, for true enforcement; revisit if it proves noisy.
- Whether `ux-research` appends UNVERIFIED entries to `citations.json` directly (spec assumes
  yes, since drafting is permitted) or only proposes them for the human to paste.

## Verification

- `claude plugin validate tools/preview-ds` passes.
- With the plugin loaded, editing a page that introduces a hex value or inline style triggers the
  house-style hook in-session; editing `partials/nav.html` is denied with the redirect message.
- `/author-component <id>` runs the pipeline end to end and stops at both human gates.
- `manifest-integrity` and `citation-auditor` each return a located worklist on the current repo.
- The whole `tools/preview-ds/` directory can be removed without affecting the runtime site
  (tooling is separable from the system).
