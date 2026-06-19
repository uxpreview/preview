# preview-ds

The Claude Code plugin that packages the Preview Design System's authoring, evidence, and
enforcement workflow. It is the tooling layer: it operates on the system (`manifest.json`,
`citations.json`, `css/`, `pages/`) but contains none of it. Removing this directory does
not affect the runtime site.

## What's inside

**Hooks** (`hooks/hooks.json`, deterministic, always on)
- house-style (PostToolUse) — blocks edits that introduce raw color, inline-style color,
  or doc-chrome on a client page. Scoped to `.html`/`.css`.
- generated-file guard (PreToolUse) — denies edits to `partials/nav.html` and
  `dist/wire.bundle.css`, pointing at the real source.

**Skills**
- `ux-research` — researches UX best practice and drafts tiered, UNVERIFIED candidate
  citations into `citations.json`. Reuse-checks the store first; never invents or verifies.
- `validate` (`/validate`) — the full gate: house style, token contrast, links, axe, and
  the judgment checklist.
- `author-component` (`/author-component <id>`) — orchestrates research → build → wire →
  review → validate, stopping at the two human gates.
- `preview-component-page` — builds a component's Usage/Specs/Accessibility page from a
  brief (moved here from `.claude/skills/`).

**Sub-agents** (read-only reviewers)
- `manifest-integrity` — manifest vs CSS vs nav vs pages vs citations; runs the contrast
  and link scripts.
- `citation-auditor` — the UNVERIFIED queue, claims-cited-as-fact, dead URLs, over-tiering.

**Scripts** (shared by hooks, skills, and agents — one source of truth)
- `house-style.mjs`, `guard-generated.mjs`, `token-contrast.mjs`, `link-check.mjs`.

## Install / dev loop

- Dev iteration: `claude --plugin-dir tools/preview-ds`.
- Installed: add the repo-root `marketplace.json`, then `claude plugin marketplace add .`
  and `claude plugin install preview-ds@preview`.
- Validate structure: `claude plugin validate tools/preview-ds`.
- Skill edits apply live; hook/agent changes need `/reload-plugins` or a restart.
- Migration note: `preview-component-page` now lives here; the old
  `.claude/skills/preview-component-page/` copy should be removed once the plugin is
  installed, so it loads from one place.

## Which skills, which mode

The plugin encodes the discipline for the **core grayscale system**. Match other skills to
the artifact you are working on:

- **Core grayscale system** — discipline and process skills only:
  `verification-before-completion` (its principle is baked into `validate`),
  `brainstorming` before designing a new component's variants or an experience,
  `writing-plans`/`executing-plans` for batch migrations, `skill-creator`/`writing-skills`
  when extending this plugin. Visual-craft skills stay **off** here
  (`frontend-design`, `impeccable`, `ui-ux-pro-max`): they generate color and inline styles
  the house-style hook rejects.
- **Client / pitch work** — `frontend-design`, `impeccable`, and `concept-studio-pro` are
  **on**. A different artifact, a different toolkit.
- **QA** — automated coverage is `validate` + `manifest-integrity` + the axe/Lighthouse
  gates; manual accessibility is `design:accessibility-review` as an optional deeper pass.

External skills: no bulk installs. The registry is mostly noise for this project; the real
gaps are differentiators no off-the-shelf skill covers. The one optional future add is
`microsoft/playwright-cli` when the visual-regression baseline track begins.
