# CLAUDE.md — Preview Design System

You are working inside the **Preview Design System**: a grayscale, tokens-first
wireframe and mid-fidelity system for client work in healthcare and higher-ed.

This file is the **constant**. It does not change between projects. The only thing
that changes per engagement is the **project brief** (template at the bottom). Read
this file and `manifest.json` before doing anything; don't re-derive the system from
the source each session.

---

## The objective

Given (1) this system and (2) a project brief, **compose a project-specific
prototype from existing parts only.** The win is a strong first draft in seconds
that I then edit — not a finished deliverable, and not a from-scratch design.

A good output:
- uses only components/classes/tokens that already exist (see `manifest.json`),
- reads as plausible for *this* client (real-sounding content from the brief, never lorem ipsum),
- is a single page or small set of pages that open directly in a browser,
- passes the validation checklist below before you hand it back.

## The mental model

Compose by level, lowest that fits:
**atom → molecule → organism → template → experience.**
- Need a whole page type? Start from a **template** in `manifest.json` and adapt.
- Need a directory / multi-step flow? Start from an **experience** and pick a variant.
- Need to fill a slot? Grab a **component**.
Never start from a blank page when a template or experience already covers the intent.

## Hard constraints (do not violate)

- **Grayscale only.** Hierarchy from weight, scale, space — never hue.
- **Tokens only.** Every value references `tokens.css`. No hardcoded values.
- **No new tokens, no new components, no inline styles.** If something seems missing,
  say so and propose the closest existing part — don't invent.
- **Content variations, not style overrides.** Change copy and structure; never restyle.
- **Plain HTML + CSS, no build step.** The file must work opened directly.
- **Prefixes:** components `wire-`, utilities `u-`.
- **WCAG 2.2 AA:** visible focus on everything, targets ≥44px, contrast holds,
  reduced-motion respected, labels on all inputs.
- **Older audiences:** keep larger text defaults and the help-bar / text-size /
  phone affordances available where appropriate (healthcare).

If a request can only be satisfied by breaking one of these, **stop and flag it**
rather than quietly working around it.

## How to work a request

1. Read `manifest.json`. Confirm which template or experience matches the intent.
2. Pull verified markup from the referenced `pages/` or `docs/` file — copy real
   snippets; don't reconstruct from memory.
3. Fill content slots from the brief's content model. Make it specific and plausible.
4. Assemble. Reuse existing classes verbatim.
5. Run the validation checklist. Fix anything that fails before responding.
6. In your reply, list: what template/experience you started from, which variants you
   chose and why, and anything you had to flag.

## Validation checklist (run on your own output before finishing)

- [ ] Every `class` used exists in `manifest.json` / the stylesheet. No invented classes.
- [ ] No hardcoded colors, sizes, or spacing. No hex values. No inline `style=`.
- [ ] No color introduced anywhere. Still grayscale.
- [ ] Every input has a label; interactive elements have visible focus.
- [ ] Targets ≥44px; no `outline: none` without a replacement.
- [ ] Content is project-specific, not placeholder filler.
- [ ] File opens standalone in a browser (no build, no missing local refs).

## Output conventions

- New project work goes in `projects/<client>/` — never edit the core system files
  to fit one project. The core stays clean; projects pull it in.
- Page files: `projects/<client>/<page-id>.html`.
- If a project edit recurs across two+ projects, note it as a **system gap** at the
  end of your reply so I can decide whether to promote it into the core.

---

## PROJECT BRIEF (the variable — fill per engagement)

```
Client:
One-line positioning:        # who they are, in their own voice
Audience:                    # primary visitors; note if older / accessibility-sensitive
Sector:                      # healthcare | higher-ed | other
Pages needed:                # e.g. homepage, find-a-doctor, specialty landing
Experiences needed:          # e.g. find-a-doctor-directory (variant: filter-left)
IA / nav:                    # top-level sections, hierarchy
Content model:               # entities + sample values (provider, condition, location, story, study, stat...)
Reference URLs:              # current site or comparators, for structure not style
Must-have patterns:          # anything non-negotiable
Out of scope:                # what NOT to build
```

> Tip: this brief can be assembled from the client hub/wiki in the vault rather than
> typed from scratch. The vault holds the context; this system is the engine.
