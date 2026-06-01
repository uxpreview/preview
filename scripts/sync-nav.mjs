#!/usr/bin/env node
/* ============================================================
   sync-nav.mjs — propagate the canonical site nav.

   Source of truth: partials/nav.html (uses {{base}} path tokens).
   For each target page (design-system chrome only — never the
   pages/ demo mocks), this:
     1. Ensures NAV:START / NAV:END markers exist. If absent, it
        inserts them by replacing the page's existing
        <header class="wire-topnav">…</header> region (and any
        immediately-following wire-drawer + backdrop).
     2. Fills the marker region with the nav, substituting {{base}}
        with the correct relative prefix for the page's depth.

   No build step at runtime — this is a dev-only maintenance pass,
   like a manifest regenerator. Run: node scripts/sync-nav.mjs
   ============================================================ */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const START = '<!-- NAV:START -->';
const END = '<!-- NAV:END -->';

let nav = readFileSync(join(ROOT, 'partials/nav.html'), 'utf8')
  .replace(/^<!--[\s\S]*?-->\s*/, '')   // strip the leading doc comment
  .trim();

let footer = readFileSync(join(ROOT, 'partials/footer.html'), 'utf8')
  .replace(/^<!--[\s\S]*?-->\s*/, '')   // strip the leading doc comment
  .trim();

const FOOTER_START = '<!-- FOOTER:START -->';
const FOOTER_END = '<!-- FOOTER:END -->';
// The page's own chrome footer (matched only in the region after </main>, so
// demo footers inside the page body are never touched).
const FOOTER_RE = /<footer class="wire-footer[\s\S]*?<\/footer>/;

function targetList() {
  const list = [
    'index.html', 'directory.html',
    'components/index.html', 'components/buttons/index.html',
    'components/accordion/index.html',
    'components/badge/index.html',
    'components/tag/index.html',
    'components/divider/index.html',
    'components/tabs/index.html',
    'components/modal/index.html',
    'components/drawer/index.html',
    'components/cards/index.html',
    'components/field/index.html',
    'components/search/index.html',
    'components/choice/index.html',
    'components/form-layout/index.html',
    'components/breadcrumb/index.html',
    'components/pagination/index.html',
    'components/top-nav/index.html',
    'components/side-nav/index.html',
    'components/in-page-nav/index.html',
    'foundations/index.html', 'patterns/index.html',
    'templates/index.html', 'templates/landing/index.html', 'experiences/index.html',
    'resources/index.html',
  ];
  for (const f of readdirSync(join(ROOT, 'docs')).sort()) {
    if (f.endsWith('.html')) list.push('docs/' + f);
  }
  return list;
}

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// ---- Current-page stamping -------------------------------------------------
// Each chrome page maps to the rail link that represents it (a {{base}}-form
// href) and the section that should open. Stamping happens before {{base}}
// substitution so it's depth-independent. Pages absent here (e.g. legacy
// redirects) simply render with no current item — every section collapsed.
const CURRENT = {
  'index.html':                   { top: true, href: '{{base}}index.html' },
  'directory.html':               { section: 'Templates',    href: '{{base}}directory.html' },
  'components/index.html':        { section: 'Components',    href: '{{base}}components/' },
  'components/buttons/index.html':{ section: 'Components', group: 'Actions', href: '{{base}}components/buttons/' },
  'components/accordion/index.html':{ section: 'Components', group: 'Containment &amp; overlays', href: '{{base}}components/accordion/' },
  'components/badge/index.html':{ section: 'Components', group: 'Selection &amp; status', href: '{{base}}components/badge/' },
  'components/tag/index.html':{ section: 'Components', group: 'Selection &amp; status', href: '{{base}}components/tag/' },
  'components/divider/index.html':{ section: 'Components', group: 'Containment &amp; overlays', href: '{{base}}components/divider/' },
  'components/tabs/index.html':{ section: 'Components', group: 'Containment &amp; overlays', href: '{{base}}components/tabs/' },
  'components/modal/index.html':{ section: 'Components', group: 'Containment &amp; overlays', href: '{{base}}components/modal/' },
  'components/drawer/index.html':{ section: 'Components', group: 'Containment &amp; overlays', href: '{{base}}components/drawer/' },
  'components/cards/index.html':{ section: 'Components', group: 'Containment &amp; overlays', href: '{{base}}components/cards/' },
  'components/field/index.html':{ section: 'Components', group: 'Forms &amp; inputs', href: '{{base}}components/field/' },
  'components/search/index.html':{ section: 'Components', group: 'Forms &amp; inputs', href: '{{base}}components/search/' },
  'components/choice/index.html':{ section: 'Components', group: 'Forms &amp; inputs', href: '{{base}}components/choice/' },
  'components/form-layout/index.html':{ section: 'Components', group: 'Forms &amp; inputs', href: '{{base}}components/form-layout/' },
  'components/breadcrumb/index.html':{ section: 'Components', group: 'Navigation', href: '{{base}}components/breadcrumb/' },
  'components/pagination/index.html':{ section: 'Components', group: 'Navigation', href: '{{base}}components/pagination/' },
  'components/top-nav/index.html':{ section: 'Components', group: 'Navigation', href: '{{base}}components/top-nav/' },
  'components/side-nav/index.html':{ section: 'Components', group: 'Navigation', href: '{{base}}components/side-nav/' },
  'components/in-page-nav/index.html':{ section: 'Components', group: 'Navigation', href: '{{base}}components/in-page-nav/' },
  'foundations/index.html':       { section: 'Foundations',   href: '{{base}}foundations/' },
  'patterns/index.html':          { section: 'Patterns',      href: '{{base}}patterns/' },
  'templates/index.html':         { section: 'Templates',     href: '{{base}}templates/' },
  'templates/landing/index.html': { section: 'Templates',     href: '{{base}}templates/landing/' },
  'experiences/index.html':       { section: 'Experiences',   href: '{{base}}experiences/' },
  'resources/index.html':         { section: 'Resources',     href: '{{base}}resources/' },
  'docs/principles.html':         { section: 'Foundations',   href: '{{base}}docs/principles.html' },
  'docs/tokens.html':             { section: 'Foundations',   href: '{{base}}docs/tokens.html' },
  'docs/typography.html':         { section: 'Foundations',   href: '{{base}}docs/typography.html' },
  'docs/iconography.html':        { section: 'Foundations',   href: '{{base}}docs/iconography.html' },
  'docs/layout.html':             { section: 'Foundations',   href: '{{base}}docs/layout.html' },
  'docs/motion.html':             { section: 'Foundations',   href: '{{base}}docs/motion.html' },
  'docs/elevation.html':          { section: 'Foundations',   href: '{{base}}docs/elevation.html' },
  'docs/content.html':            { section: 'Foundations',   href: '{{base}}docs/content.html' },
  'docs/accessibility.html':      { section: 'Foundations',   href: '{{base}}docs/accessibility.html' },
  'docs/utilities.html':          { section: 'Resources',     href: '{{base}}docs/utilities.html' },
  'docs/research.html':           { section: 'Resources',     href: '{{base}}docs/research.html' },
  'docs/validation.html':         { section: 'Resources',     href: '{{base}}docs/validation.html' },
  'docs/component-status.html':   { section: 'Resources',     href: '{{base}}docs/component-status.html' },
  'docs/cards.html':              { section: 'Components', group: 'Containment &amp; overlays', href: '{{base}}docs/cards.html' },
  'docs/lists.html':              { section: 'Components', group: 'Content &amp; display', href: '{{base}}docs/lists.html' },
  'docs/tables.html':             { section: 'Components', group: 'Content &amp; display', href: '{{base}}docs/tables.html' },
  'docs/media.html':              { section: 'Components', group: 'Content &amp; display', href: '{{base}}docs/media.html' },
  'docs/feedback.html':           { section: 'Components', group: 'Messaging &amp; feedback', href: '{{base}}docs/feedback.html' },
  'docs/heroes.html':             { section: 'Components', group: 'Layout', href: '{{base}}docs/heroes.html' },
  'docs/content-blocks.html':     { section: 'Components',      href: '{{base}}docs/content-blocks.html' },
  'docs/footers.html':            { section: 'Components', group: 'Layout', href: '{{base}}docs/footers.html' },
  'docs/page-shells.html':        { section: 'Templates',      href: '{{base}}docs/page-shells.html' },
};

function stampCurrent(navStr, rel) {
  const c = CURRENT[rel];
  if (!c) return navStr;
  let out = navStr;
  // Stamp the current link from the start of its own section, so a href that is
  // ALSO linked elsewhere in the rail (e.g. docs/research.html appears as both
  // the Components "Citation list" leaf and the Resources "Evidence model" leaf)
  // is marked in the right place rather than at its first occurrence anywhere.
  let from = 0;
  if (c.section) {
    // The summary may wrap its label in an <a> (a section that links to its own
    // index, e.g. Components), so allow an optional anchor open-tag before the name.
    out = out.replace(
      new RegExp('<details class="wire-doc-nav__section">(\\s*<summary class="wire-doc-nav__section-summary">(?:<a\\b[^>]*>)?' + esc(c.section) + ')'),
      '<details class="wire-doc-nav__section" open>$1'
    );
    const at = out.search(new RegExp('<details class="wire-doc-nav__section" open>\\s*<summary class="wire-doc-nav__section-summary">(?:<a\\b[^>]*>)?' + esc(c.section)));
    if (at !== -1) from = at;
  }
  // Category groups are always-visible now (flat, Nextra-style), so opening the
  // section that holds the page is enough. The `group` field in CURRENT is kept
  // as documentation of where each page lives, but no longer drives markup.
  //
  // Stamp the rail link by href, whatever its class — a leaf (wire-doc-nav__link),
  // a standalone top-link, or a section label that's itself a link
  // (wire-doc-nav__section-link). Scoped to the section's region (see above).
  const head = out.slice(0, from);
  const tail = out.slice(from).replace(
    new RegExp('<a class="([^"]*)" href="' + esc(c.href) + '">'),
    (m, klass) => `<a class="${klass} is-current" aria-current="page" href="${c.href}">`
  );
  return head + tail;
}

// Ensure <body> carries the wire-shell class so the shell layout applies.
// Idempotent; only ever adds the class to chrome pages (the sync targets).
function ensureShellBody(html) {
  if (/<body[^>]*\bwire-shell\b/.test(html)) return html;
  return html.replace(/<body(\s[^>]*)?>/, (m, attrs) => {
    if (!attrs) return '<body class="wire-shell">';
    if (/\sclass="/.test(attrs)) {
      return '<body' + attrs.replace(/class="([^"]*)"/, (mm, val) => `class="${val} wire-shell"`) + '>';
    }
    return '<body' + attrs + ' class="wire-shell">';
  });
}

// Pre-paint theme init: sets <html data-theme> from the saved preference (or
// the OS, for "system") BEFORE first paint, so dark-mode users get no flash.
// Inline + guarded; the only head-JS, injected on chrome pages only. Idempotent.
const THEME_INIT = `<script>(function(){try{var t=localStorage.getItem('wire-theme')||'system';var d=t==='dark'||(t==='system'&&window.matchMedia&&window.matchMedia('(prefers-color-scheme:dark)').matches);document.documentElement.setAttribute('data-theme',d?'dark':'light');}catch(e){}})();</script>`;

function ensureThemeInit(html) {
  if (html.includes("localStorage.getItem('wire-theme')")) return html;
  if (!/<\/head>/i.test(html)) return html;
  return html.replace(/<\/head>/i, '  ' + THEME_INIT + '\n</head>');
}

// Propagate the canonical footer. Operates ONLY on the region after the last
// </main> so demo footers in the page body are never replaced. First run swaps
// the page's existing chrome footer for the markers; thereafter it fills them.
function syncFooter(html, base) {
  const mi = html.lastIndexOf('</main>');
  if (mi === -1) return html;
  const cut = mi + '</main>'.length;
  const head = html.slice(0, cut);
  let tail = html.slice(cut);
  if (!tail.includes(FOOTER_START)) {
    if (!FOOTER_RE.test(tail)) return html;   // no chrome footer to replace
    tail = tail.replace(FOOTER_RE, `${FOOTER_START}\n${FOOTER_END}`);
  }
  const block = `${FOOTER_START}\n${footer.replace(/\{\{base\}\}/g, base)}\n${FOOTER_END}`;
  const region = new RegExp(esc(FOOTER_START) + '[\\s\\S]*?' + esc(FOOTER_END));
  return head + tail.replace(region, block);
}

// Match a page's existing top-chrome: the topnav header, plus an
// optional comment, drawer aside, and backdrop that follow it.
const CHROME_RE = new RegExp(
  '<header class="wire-topnav">[\\s\\S]*?</header>' +
  '(?:\\s*<!--[^]*?-->)?' +
  '(?:\\s*<aside[^>]*\\bwire-drawer\\b[^>]*>[\\s\\S]*?</aside>)?' +
  '(?:\\s*<div class="wire-drawer-backdrop"></div>)?'
);

let updated = 0, skipped = 0, missing = 0;
for (const rel of targetList()) {
  const abs = join(ROOT, rel);
  let html;
  try { html = readFileSync(abs, 'utf8'); }
  catch { missing++; console.warn('  missing  ', rel); continue; }

  // 1. Ensure markers.
  if (!html.includes(START)) {
    if (CHROME_RE.test(html)) {
      html = html.replace(CHROME_RE, `${START}\n${END}`);
    } else {
      skipped++; console.warn('  no anchor', rel, '(add NAV markers by hand)');
      continue;
    }
  }

  // 2. Fill markers with depth-correct, current-stamped nav.
  const depth = rel.split('/').length - 1;
  const base = '../'.repeat(depth);
  const stamped = stampCurrent(nav, rel);
  const block = `${START}\n${stamped.replace(/\{\{base\}\}/g, base)}\n${END}`;
  const region = new RegExp(esc(START) + '[\\s\\S]*?' + esc(END));
  let next = html.replace(region, block);

  // 3. Ensure the shell body class so the chrome layout applies.
  next = ensureShellBody(next);

  // 4. Ensure the pre-paint theme-init script is in <head> (no-flash dark mode).
  next = ensureThemeInit(next);

  // 5. Propagate the canonical footer (single-sourced like the nav).
  next = syncFooter(next, base);

  if (next !== html) { writeFileSync(abs, next); updated++; console.log('  synced   ', rel, `(base="${base}")`); }
  else { skipped++; }
}
console.log(`\nsync-nav: ${updated} updated, ${skipped} skipped, ${missing} missing`);
