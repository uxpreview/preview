#!/usr/bin/env node
/* ============================================================
   build-ia.mjs — manifest-driven information architecture.

   Source of truth: manifest.json → `nav` (the ordered rail tree).
   This script:
     1. Generates partials/nav.html from `nav` (top links, collapsible
        sections, and the second level of disclosure — collapsible
        category/group <details>).
     2. Stubs any page a rail link points to that doesn't exist yet
        (full doc-shell "Planned" page; demo pages get a minimal
        placeholder).
     3. Derives the sync target list + current-page map from `nav`.
     4. Propagates the canonical nav + footer + shell body + theme-init
        into every doc-chrome page, stamping the current section AND the
        current category group open.

   Dev-only maintenance pass; no runtime dependency. Run:
     node scripts/build-ia.mjs
   `scripts/sync-nav.mjs` is a thin shim that calls run() here.
   ============================================================ */
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const START = '<!-- NAV:START -->';
const END = '<!-- NAV:END -->';
const FOOTER_START = '<!-- FOOTER:START -->';
const FOOTER_END = '<!-- FOOTER:END -->';

const manifest = JSON.parse(readFileSync(join(ROOT, 'manifest.json'), 'utf8'));
const NAV = manifest.nav;

const htmlesc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const isLocal = (ref) => ref && !/^https?:/.test(ref);
const isDemo = (ref) => ref && ref.startsWith('pages/');
const refToFile = (ref) => (ref.endsWith('/') ? ref + 'index.html' : ref);
const depthOf = (rel) => '../'.repeat(rel.split('/').length - 1);

// ---------------------------------------------------------------------------
// 1. NAV HTML GENERATION  (uses {{base}} tokens; substituted per page later)
// ---------------------------------------------------------------------------
function renderLeaf(p) {
  return `          <li class="wire-doc-nav__item"><a class="wire-doc-nav__link" href="{{base}}${p.ref}">${htmlesc(p.label)}</a></li>`;
}
function renderGroup(g) {
  const leaves = g.items.map(renderLeaf).join('\n');
  return `        <details class="wire-doc-nav__group">
          <summary class="wire-doc-nav__group-summary">${htmlesc(g.label)}</summary>
          <ul class="wire-doc-nav__list" role="list">
${leaves}
          </ul>
        </details>`;
}
function renderSectionBody(items) {
  const out = [];
  let flat = [];
  const flushFlat = () => {
    if (!flat.length) return;
    out.push(`        <ul class="wire-doc-nav__list" role="list">\n${flat.map(renderLeaf).join('\n')}\n        </ul>`);
    flat = [];
  };
  for (const it of items) {
    if (it.type === 'group') { flushFlat(); out.push(renderGroup(it)); }
    else flat.push(it);
  }
  flushFlat();
  return out.join('\n\n');
}
function renderSection(s) {
  const summary = s.ref
    ? `<a class="wire-doc-nav__section-link" href="{{base}}${s.ref}">${htmlesc(s.label)}</a>`
    : htmlesc(s.label);
  return `    <details class="wire-doc-nav__section">
      <summary class="wire-doc-nav__section-summary">${summary}</summary>
      <div class="wire-doc-nav__section-body">
${renderSectionBody(s.items)}
      </div>
    </details>`;
}
function buildNavHtml() {
  const topLinks = NAV.filter((n) => n.type === 'link')
    .map((n) => `    <a class="wire-doc-nav__top-link" href="{{base}}${n.ref}">${htmlesc(n.label)}</a>`)
    .join('\n');
  const sections = NAV.filter((n) => n.type === 'section').map(renderSection).join('\n\n');

  const THEME = `    <div class="wire-doc-nav__theme" data-wire-theme role="group" aria-label="Color theme">
      <button type="button" class="wire-doc-nav__theme-btn" data-wire-theme-value="light" aria-pressed="false" aria-label="Light theme" title="Light">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="4.5"></circle><line x1="12" y1="2" x2="12" y2="4"></line><line x1="12" y1="20" x2="12" y2="22"></line><line x1="4.2" y1="4.2" x2="5.6" y2="5.6"></line><line x1="18.4" y1="18.4" x2="19.8" y2="19.8"></line><line x1="2" y1="12" x2="4" y2="12"></line><line x1="20" y1="12" x2="22" y2="12"></line><line x1="4.2" y1="19.8" x2="5.6" y2="18.4"></line><line x1="18.4" y1="5.6" x2="19.8" y2="4.2"></line></svg>
      </button>
      <button type="button" class="wire-doc-nav__theme-btn" data-wire-theme-value="dark" aria-pressed="false" aria-label="Dark theme" title="Dark">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M21 12.8A8.5 8.5 0 1 1 11.2 3a6.6 6.6 0 0 0 9.8 9.8z"></path></svg>
      </button>
      <button type="button" class="wire-doc-nav__theme-btn" data-wire-theme-value="system" aria-pressed="false" aria-label="System theme" title="System">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="3" y="4" width="18" height="12" rx="1.5"></rect><line x1="9" y1="20" x2="15" y2="20"></line><line x1="12" y1="16" x2="12" y2="20"></line></svg>
      </button>
    </div>`;

  return `<!-- ============================================================
     GENERATED by scripts/build-ia.mjs from manifest.json → nav.
     Do NOT hand-edit this file or the copy injected into pages.
     Edit manifest.json's \`nav\` tree and re-run \`node scripts/build-ia.mjs\`.

     A slim fixed header (brand + view-source + mobile burger) and ONE
     rail (#site-nav): persistent left nav on desktop, off-canvas
     slide-over on mobile. Two levels of disclosure — collapsible
     sections, and collapsible category groups inside them.
     {{base}} is replaced per-page with the correct relative prefix.
     Design-system chrome only; pages/ demo mocks keep their own nav.
     ============================================================ -->
<header class="wire-topnav wire-topnav--shell">
  <div class="wire-topnav__inner">
    <div class="wire-topnav__lead">
      <button class="wire-button wire-button--icon-only wire-button--ghost wire-topnav__burger" data-wire-drawer-open="site-nav" aria-label="Open navigation">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true" focusable="false"><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
      </button>
      <a href="{{base}}index.html" class="wire-topnav__brand" aria-label="Preview">
        <span>Preview</span>
      </a>
    </div>

    <div class="wire-topnav__utility">
      <a class="wire-topnav__source" href="https://github.com/uxpreview/preview">View source</a>
    </div>
  </div>
</header>

<!-- One rail: persistent left nav (desktop) + slide-over (mobile). -->
<nav id="site-nav" class="wire-railnav" aria-label="Sections">
  <button class="wire-button wire-button--ghost wire-button--sm wire-railnav__close" data-wire-drawer-close>← Close</button>
  <div class="wire-doc-nav">
    <div class="wire-doc-nav__search" data-wire-nav-search>
      <svg class="wire-doc-nav__search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="11" cy="11" r="7"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
      <label class="u-visually-hidden" for="nav-search">Filter the navigation</label>
      <input id="nav-search" type="search" class="wire-doc-nav__search-input" placeholder="Search…" autocomplete="off">
    </div>
    <div class="wire-doc-nav__scroll">
${topLinks}

${sections}
    </div>

${THEME}
  </div>
</nav>
<div class="wire-drawer-backdrop"></div>`;
}

// ---------------------------------------------------------------------------
// 2. STUB GENERATION
// ---------------------------------------------------------------------------
function crumb(label, href) {
  return href
    ? `<li class="wire-breadcrumb__item"><a class="wire-breadcrumb__link" href="${href}">${htmlesc(label)}</a></li>`
    : `<li class="wire-breadcrumb__item"><span class="wire-breadcrumb__current" aria-current="page">${htmlesc(label)}</span></li>`;
}
function chromeStub(file, label, sectionLabel, sectionRef) {
  const base = depthOf(file);
  const crumbs = [];
  if (sectionLabel) crumbs.push(crumb(sectionLabel, sectionRef ? base + sectionRef : null));
  crumbs.push(crumb(label, null));
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${htmlesc(label)} — Preview Design System</title>
  <link rel="stylesheet" href="${base}css/wire.css">
</head>
<body class="wire-shell">

<a href="#main" class="wire-skip-link">Skip to content</a>

${START}
${END}

<main id="main">

  <section class="u-section">
    <div class="u-container u-container--wide">

      <nav class="wire-breadcrumb" aria-label="Breadcrumb">
        <ol class="wire-breadcrumb__list">
${crumbs.map((c) => '          ' + c).join('\n')}
        </ol>
      </nav>

      <header class="wire-doc-header">
        <div class="wire-doc-header__row">
          <h1 class="wire-doc-header__title">${htmlesc(label)}</h1>
          <span class="wire-doc-header__status"><span class="wire-status-pill">Planned</span></span>
        </div>
        <p class="wire-doc-header__lead">This page is planned. It is part of the target information architecture; documentation is in progress.</p>
      </header>

    </div>
  </section>

</main>

${FOOTER_START}
${FOOTER_END}

<script src="${base}js/wire.js" defer></script>
</body>
</html>
`;
}
function demoStub(file, label) {
  const base = depthOf(file);
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${htmlesc(label)} — Preview</title>
  <link rel="stylesheet" href="${base}css/wire.css">
</head>
<body>
<main id="main">
  <section class="u-section">
    <div class="u-container">
      <p class="wire-eyebrow">Demo · planned</p>
      <h1 class="wire-h1">${htmlesc(label)}</h1>
      <p class="wire-lead">This demo page is planned and not built yet.</p>
      <p><a href="${base}index.html">← Back to Preview</a></p>
    </div>
  </section>
</main>
</body>
</html>
`;
}
function writeStub(file, html) {
  const abs = join(ROOT, file);
  mkdirSync(dirname(abs), { recursive: true });
  writeFileSync(abs, html);
}

// ---------------------------------------------------------------------------
// 3. DERIVE target list + current map; create stubs while walking
// ---------------------------------------------------------------------------
// Legacy chrome pages no longer surfaced in the rail (Patterns/Experiences
// folded into Foundations ▸ UX guidance / Templates ▸ Advanced) but kept on
// disk — still synced so they never show stale chrome if reached directly.
const targetSet = new Set(['index.html', 'directory.html', 'patterns/index.html', 'experiences/index.html']);
const CURRENT = {};
let stubbedChrome = 0, stubbedDemo = 0;

function register(label, ref, status, sectionLabel, sectionRef, groupLabel) {
  if (!isLocal(ref)) return;
  const file = refToFile(ref);
  if (isDemo(ref)) {
    if (!existsSync(join(ROOT, file))) { writeStub(file, demoStub(file, label)); stubbedDemo++; }
    return; // demo pages keep their own nav: never synced
  }
  if (!existsSync(join(ROOT, file))) {
    writeStub(file, chromeStub(file, label, sectionLabel, sectionRef));
    stubbedChrome++;
  }
  targetSet.add(file);
  const cur = { href: '{{base}}' + ref };
  if (sectionLabel) cur.section = htmlesc(sectionLabel);
  if (groupLabel) cur.group = htmlesc(groupLabel);
  if (!sectionLabel) cur.top = true;
  CURRENT[file] = cur; // last-wins (a shared ref resolves to its last section)
}

for (const node of NAV) {
  if (node.type === 'link') { register(node.label, node.ref, node.status, null, null, null); continue; }
  // section
  if (node.ref) register(node.label, node.ref, null, node.label, node.ref, null); // section index
  for (const it of node.items) {
    if (it.type === 'group') {
      for (const leaf of it.items) register(leaf.label, leaf.ref, leaf.status, node.label, node.ref, it.label);
    } else {
      register(it.label, it.ref, it.status, node.label, node.ref, null);
    }
  }
}

// Keep every legacy docs/*.html in sync even if not surfaced in the rail.
for (const f of readdirSync(join(ROOT, 'docs')).sort()) {
  if (f.endsWith('.html')) targetSet.add('docs/' + f);
}

// ---------------------------------------------------------------------------
// 4. PROPAGATION
// ---------------------------------------------------------------------------
const NAV_HTML = buildNavHtml();
let footer = readFileSync(join(ROOT, 'partials/footer.html'), 'utf8').replace(/^<!--[\s\S]*?-->\s*/, '').trim();

const THEME_INIT = `<script>(function(){try{var t=localStorage.getItem('wire-theme')||'system';var d=t==='dark'||(t==='system'&&window.matchMedia&&window.matchMedia('(prefers-color-scheme:dark)').matches);document.documentElement.setAttribute('data-theme',d?'dark':'light');}catch(e){}})();</script>`;

const CHROME_RE = new RegExp(
  '<header class="wire-topnav">[\\s\\S]*?</header>' +
  '(?:\\s*<!--[^]*?-->)?' +
  '(?:\\s*<aside[^>]*\\bwire-drawer\\b[^>]*>[\\s\\S]*?</aside>)?' +
  '(?:\\s*<div class="wire-drawer-backdrop"></div>)?'
);
const FOOTER_RE = /<footer class="wire-footer[\s\S]*?<\/footer>/;

function stampCurrent(navStr, rel) {
  const c = CURRENT[rel];
  if (!c) return navStr;
  let out = navStr, from = 0;
  if (c.section) {
    out = out.replace(
      new RegExp('<details class="wire-doc-nav__section">(\\s*<summary class="wire-doc-nav__section-summary">(?:<a\\b[^>]*>)?' + esc(c.section) + ')'),
      '<details class="wire-doc-nav__section" open>$1'
    );
    const at = out.search(new RegExp('<details class="wire-doc-nav__section" open>\\s*<summary class="wire-doc-nav__section-summary">(?:<a\\b[^>]*>)?' + esc(c.section)));
    if (at !== -1) from = at;
  }
  const head = out.slice(0, from);
  let tail = out.slice(from);
  if (c.group) {
    tail = tail.replace(
      new RegExp('<details class="wire-doc-nav__group">(\\s*<summary class="wire-doc-nav__group-summary">' + esc(c.group) + ')'),
      '<details class="wire-doc-nav__group" open>$1'
    );
  }
  tail = tail.replace(
    new RegExp('<a class="([^"]*)" href="' + esc(c.href) + '">'),
    (m, klass) => `<a class="${klass} is-current" aria-current="page" href="${c.href}">`
  );
  return head + tail;
}

function ensureShellBody(html) {
  if (/<body[^>]*\bwire-shell\b/.test(html)) return html;
  return html.replace(/<body(\s[^>]*)?>/, (m, attrs) => {
    if (!attrs) return '<body class="wire-shell">';
    if (/\sclass="/.test(attrs)) return '<body' + attrs.replace(/class="([^"]*)"/, (mm, v) => `class="${v} wire-shell"`) + '>';
    return '<body' + attrs + ' class="wire-shell">';
  });
}
function ensureThemeInit(html) {
  if (html.includes("localStorage.getItem('wire-theme')")) return html;
  if (!/<\/head>/i.test(html)) return html;
  return html.replace(/<\/head>/i, '  ' + THEME_INIT + '\n</head>');
}
function syncFooter(html, base) {
  const mi = html.lastIndexOf('</main>');
  if (mi === -1) return html;
  const cut = mi + '</main>'.length;
  const head = html.slice(0, cut);
  let tail = html.slice(cut);
  if (!tail.includes(FOOTER_START)) {
    if (!FOOTER_RE.test(tail)) return html;
    tail = tail.replace(FOOTER_RE, `${FOOTER_START}\n${FOOTER_END}`);
  }
  const block = `${FOOTER_START}\n${footer.replace(/\{\{base\}\}/g, base)}\n${FOOTER_END}`;
  const region = new RegExp(esc(FOOTER_START) + '[\\s\\S]*?' + esc(FOOTER_END));
  return head + tail.replace(region, block);
}

// ---------------------------------------------------------------------------
// 5. COMPONENTS LANDING  (cards generated from the same manifest as the rail)
// ---------------------------------------------------------------------------
const LANDING_START = '<!-- LANDING:START -->';
const LANDING_END = '<!-- LANDING:END -->';

function cardPill(comp, ref) {
  const status = (comp && comp.status) || 'planned';
  if (status === 'planned') return { text: 'Planned', pending: true };
  if (ref.startsWith('docs/')) return { text: 'Migrating', pending: true };
  if (status === 'beta') return { text: 'Beta', pending: true };
  return { text: 'Stable', pending: false };
}

function buildComponentsLanding(base) {
  const byId = new Map(manifest.components.map((c) => [c.id, c]));
  const section = NAV.find((n) => n.label === 'Components');
  const groups = section.items.filter((it) => it.type === 'group');
  let total = 0;

  const sections = groups.map((g) => {
    const cards = g.items.map((leaf) => {
      total++;
      const comp = byId.get(leaf.id) || {};
      const { text, pending } = cardPill(comp, leaf.ref);
      const pillClass = 'wire-status-pill' + (pending ? ' wire-status-pill--pending' : '');
      const desc = comp.desc ? `<p class="u-text-muted">${htmlesc(comp.desc)}</p>` : '';
      return `            <a class="wire-card wire-card--linked" href="${base}${leaf.ref}"><div class="wire-card__body"><span class="${pillClass}">${text}</span><h3 class="wire-card__title">${htmlesc(leaf.label)}</h3>${desc}</div></a>`;
    }).join('\n');
    return `        <section aria-labelledby="cat-${g.category}">
          <header class="u-stack u-stack--xs">
            <h2 class="wire-h3" id="cat-${g.category}">${htmlesc(g.label)}</h2>
            <p class="u-text-muted">${htmlesc(g.desc || '')}</p>
          </header>
          <div class="u-grid" style="--grid-min: 16rem; margin-block-start: var(--space-lg);">
${cards}
          </div>
        </section>`;
  }).join('\n\n');

  return `  <section class="u-section">
    <div class="u-container">

      <header class="wire-doc-header">
        <span class="wire-doc-header__eyebrow">Components</span>
        <h1 class="wire-doc-header__title">${total} components in ${groups.length} categories.</h1>
        <p class="wire-doc-header__lead">Every component in the system, grouped by what it does. Each one carries an anatomy diagram, a spec sheet, written guidelines, and an accessibility profile. Click a card to start.</p>
      </header>

      <div class="u-stack u-stack--3xl" style="padding-block-start: var(--space-2xl);">

${sections}

      </div>
    </div>
  </section>`;
}

// A flat (un-grouped) section landing — hero + one card grid. Cards link to
// their ref; only planned leaves carry a pill (existing pages are just ready).
function buildFlatLanding(section, cfg, base) {
  const cards = section.items.filter((it) => it.type !== 'group').map((leaf) => {
    const pill = leaf.status === 'planned'
      ? '<span class="wire-status-pill wire-status-pill--pending">Planned</span>'
      : '';
    const desc = leaf.desc ? `<p class="u-text-muted">${htmlesc(leaf.desc)}</p>` : '';
    return `        <a class="wire-card wire-card--linked" href="${base}${leaf.ref}"><div class="wire-card__body">${pill}<h3 class="wire-card__title">${htmlesc(leaf.label)}</h3>${desc}</div></a>`;
  }).join('\n');
  return `  <section class="u-section">
    <div class="u-container">

      <header class="wire-doc-header">
        <span class="wire-doc-header__eyebrow">${htmlesc(section.label)}</span>
        <h1 class="wire-doc-header__title">${htmlesc(cfg.title)}</h1>
        <p class="wire-doc-header__lead">${htmlesc(cfg.lead)}</p>
      </header>

      <div class="u-grid" style="--grid-min: 16rem; margin-block-start: var(--space-2xl);">
${cards}
      </div>
    </div>
  </section>`;
}

// Fill (and self-heal) a LANDING region in a section index page. Returns 1 if
// the file changed, else 0.
function fillLandingRegion(rel, landingHtml) {
  const abs = join(ROOT, rel);
  let html;
  try { html = readFileSync(abs, 'utf8'); } catch { return 0; }
  if (!html.includes(LANDING_START)) {
    if (!/<main id="main">[\s\S]*?<\/main>/.test(html)) return 0;
    html = html.replace(/(<main id="main">)[\s\S]*?(<\/main>)/, `$1\n${LANDING_START}\n${LANDING_END}\n$2`);
  }
  const region = new RegExp(esc(LANDING_START) + '[\\s\\S]*?' + esc(LANDING_END));
  const next = html.replace(region, `${LANDING_START}\n${landingHtml}\n${LANDING_END}`);
  if (next === html) return 0;
  writeFileSync(abs, next);
  return 1;
}

// Regenerate every generated section landing. Returns the count changed.
function fillLandings() {
  let n = 0;
  n += fillLandingRegion('components/index.html', buildComponentsLanding('../'));
  const styles = NAV.find((s) => s.label === 'Styles');
  if (styles) {
    n += fillLandingRegion('styles/index.html', buildFlatLanding(styles, {
      title: 'The visual language.',
      lead: 'Color, type, iconography, shape, elevation, and motion — and the tokens that encode them.',
    }, '../'));
  }
  return n;
}

export function run() {
  // Emit the canonical partial (handy for diffing / reference).
  writeFileSync(join(ROOT, 'partials/nav.html'), NAV_HTML + '\n');

  let updated = 0, skipped = 0, missing = 0;
  for (const rel of [...targetSet].sort()) {
    const abs = join(ROOT, rel);
    let html;
    try { html = readFileSync(abs, 'utf8'); }
    catch { missing++; console.warn('  missing  ', rel); continue; }

    if (!html.includes(START)) {
      if (CHROME_RE.test(html)) html = html.replace(CHROME_RE, `${START}\n${END}`);
      else { skipped++; console.warn('  no anchor', rel, '(add NAV markers by hand)'); continue; }
    }

    const base = depthOf(rel);
    const stamped = stampCurrent(NAV_HTML, rel);
    const block = `${START}\n${stamped.replace(/\{\{base\}\}/g, base)}\n${END}`;
    const region = new RegExp(esc(START) + '[\\s\\S]*?' + esc(END));
    let next = html.replace(region, block);
    next = ensureShellBody(next);
    next = ensureThemeInit(next);
    next = syncFooter(next, base);

    if (next !== html) { writeFileSync(abs, next); updated++; }
    else skipped++;
  }

  const landings = fillLandings();
  console.log(`build-ia: stubs created — ${stubbedChrome} chrome, ${stubbedDemo} demo`);
  console.log(`build-ia: nav propagated — ${updated} updated, ${skipped} unchanged, ${missing} missing (of ${targetSet.size} targets)`);
  console.log(`build-ia: section landings — ${landings} regenerated`);
}

// Run when invoked directly.
if (process.argv[1] && process.argv[1].endsWith('build-ia.mjs')) run();
