# Contributing

The system grows by adding pages and components, not by ad-hoc edits. This file is the gate: every contribution clears the ten rules below before it lands.

If a rule blocks legitimate work, that's a conversation, not a workaround.

## The ten rules

1. **Tokens only.** No raw values in component or page CSS. Every length is a `var(--space-*)` or `var(--text-*)`; every color is a `var(--color-*)` or `var(--gray-*)`. Verify with `grep -rE '[0-9]+px|#[0-9a-f]{3,6}|rgb\(' css/components/ <new file>` — should return nothing except hairline `0` or `1px` borders where logical properties don't yet help.

2. **One docs page per component family.** New component? Add `docs/<component>.html` with five sections: anatomy (labeled markup), when to use, when not to use, variants (live), accessibility notes, and a collapsed `<details>` code snippet. Group related components on one page only when they truly belong together — see `docs/feedback.html` and `docs/content-blocks.html`.

3. **One demo usage.** Every component appears in at least one real demo page under `pages/` so it's exercised in production-like layout, not just isolated docs. If you can't find a place for it, the component might not be needed yet.

4. **One citation.** Every new component gets a row in the [Component basis table](docs/research.html#component-basis) tagged either Evidence (with a link to a standard, peer-reviewed source, or established design-system spec) or Convention (industry consensus, designer judgment). The system is honest about the difference.

5. **Mobile-first CSS.** Defaults work at 320px. Complexity engages only above breakpoints (`30em`, `48em`, `64em`, `80em`). Verify by resizing to 320px wide — no horizontal scroll, all tap targets ≥ 24px, sticky elements not eating viewport.

6. **WCAG 2.2 AA.** Every interactive element has visible focus via `:focus-visible`, ≥ 24px target size, proper ARIA. Inverse contexts override `--color-focus` to `--color-text-inverse`. New JS behavior follows the [ARIA APG](https://www.w3.org/WAI/ARIA/apg/) pattern for that interaction; cite which one in a code comment.

7. **Reduced motion.** Any new animation respects `@media (prefers-reduced-motion: reduce)`. The cheapest way is to drive timing through `var(--duration-*)` tokens, which the root rule zeros out under reduced motion.

8. **Print.** Every new page archetype prints sensibly. The `print.css` rules force-expand `<details>`, hide chrome, and reveal collapsed content — but new patterns that introduce their own collapse mechanism need their own print rule. Document the print outcome for the archetype in the [print testing matrix](docs/validation.html#print).

9. **Directory in sync.** Adding a page? Add it to `directory.html` and bump the page count in both the lead paragraph and the footer. Adding a new external reference? Add a numbered entry to the `wire-citation-list` on the same page and bump the reference count.

10. **No `data-p-*` regressions.** The system uses `data-wire-*` for every JS hook. Adding new behavior in `js/wire.js`? Read via `dataset.wire*`. Verify the JS-HTML alignment with `grep -rn "dataset\.p\b" js/ --include="*.js"` — should be empty. (This rule exists because v1.2 caught two silent regressions where renaming missed the JS side.)

## How to add a new component

Use this checklist. Each item maps to one of the ten rules.

1. Create `css/components/<component>.css`. Reference tokens only.
2. Add the import to `css/wire.css` in the appropriate slot (alphabetical within the component block).
3. If the component needs JS, add an `init<Name>()` function to `js/wire.js`, call it from `boot()`, and wire it via a `[data-wire-<name>]` selector. Document the dataset reads at the top of the function.
4. Create `docs/<component>.html` with the five required sections.
5. Use the component in at least one `pages/*.html`.
6. Add a row to the Component basis table in `docs/research.html` with the Evidence or Convention tag.
7. Update `directory.html` if the docs page is genuinely new (not a section in an existing docs page).
8. Update `CHANGELOG.md` under an "Unreleased" heading or the next version block.
9. Run the validation gates: `grep` checks (no raw values, no `dataset.p`), the heading-hierarchy audit (one `<h1>` per page), and the class-resolution audit (every `wire-*` class on the new page resolves in `css/`).

## How to add a new page

1. Pick the archetype it most resembles and start from that template. Don't reinvent.
2. Follow rules 5–10. The first time you build a new archetype, also add it to the print testing matrix and browser/device matrix in `docs/validation.html`.
3. If your page introduces a new visual pattern that isn't yet a component, build the component first (above).
4. Update `directory.html` and the relevant pressure-test row in `index.html`.

## Component lifecycle

Every component carries a status. See [`docs/component-status.html`](docs/component-status.html).

- **alpha** — experimental. Class names and behavior may change. Don't use in client work.
- **beta** — working and used in at least one demo page. API may refine based on use.
- **stable** — API frozen. Won't change until the next major version. Safe for client work.
- **deprecated** — still works but scheduled for removal in the next major version. Migrate when convenient.

Promote alpha → beta after two demo-page usages without API changes. Promote beta → stable after a documented WCAG audit pass. Demote at any time if a regression surfaces; record the demotion in the changelog.

## Versioning

[Semver](https://semver.org/) as adapted in `docs/principles.html` § Semver. Short form:

- **patch** (1.x.y → 1.x.z) — token-value tweaks, bug fixes, additive variants on existing components, doc updates, audit-log additions.
- **minor** (1.x → 1.y) — new components, new pages, new docs pages, new third-party references, additive non-breaking API extensions.
- **major** (1.x → 2.0) — class-name renames, removed components, BEM convention shifts, token renames, any change that would force a client to edit their HTML.

When in doubt, ask: "Would a client who upgrades have to edit any of their own markup or CSS?" If yes, it's major.

## Reviewing a contribution

If you're reviewing someone else's PR (or a future-you change), the ten rules above are the checklist. Don't merge until each one is satisfied, or until the PR explicitly documents which rule it relaxes and why.
