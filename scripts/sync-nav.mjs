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

function targetList() {
  const list = [
    'index.html', 'directory.html',
    'components/index.html', 'components/buttons/index.html',
    'components/accordion/index.html',
    'foundations/index.html', 'patterns/index.html',
    'templates/index.html', 'experiences/index.html',
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
  'components/buttons/index.html':{ section: 'Components',    href: '{{base}}components/buttons/' },
  'components/accordion/index.html':{ section: 'Components',  href: '{{base}}components/accordion/' },
  'foundations/index.html':       { section: 'Foundations',   href: '{{base}}foundations/' },
  'patterns/index.html':          { section: 'Patterns',      href: '{{base}}patterns/' },
  'templates/index.html':         { section: 'Templates',     href: '{{base}}templates/' },
  'experiences/index.html':       { section: 'Experiences',   href: '{{base}}experiences/' },
  'docs/principles.html':         { section: 'Foundations',   href: '{{base}}docs/principles.html' },
  'docs/tokens.html':             { section: 'Foundations',   href: '{{base}}docs/tokens.html' },
  'docs/utilities.html':          { section: 'Foundations',   href: '{{base}}docs/utilities.html' },
  'docs/research.html':           { section: 'Foundations',   href: '{{base}}docs/research.html' },
  'docs/validation.html':         { section: 'Foundations',   href: '{{base}}docs/validation.html' },
  'docs/component-status.html':   { section: 'Foundations',   href: '{{base}}docs/component-status.html' },
  'docs/typography.html':         { section: 'Components',     href: '{{base}}docs/typography.html' },
  'docs/forms.html':              { section: 'Components',     href: '{{base}}docs/forms.html' },
  'docs/cards.html':              { section: 'Components',     href: '{{base}}docs/cards.html' },
  'docs/lists.html':              { section: 'Components',     href: '{{base}}docs/lists.html' },
  'docs/tables.html':             { section: 'Components',     href: '{{base}}docs/tables.html' },
  'docs/media.html':              { section: 'Components',     href: '{{base}}docs/media.html' },
  'docs/feedback.html':           { section: 'Components',     href: '{{base}}docs/feedback.html' },
  'docs/navigation.html':         { section: 'Patterns',       href: '{{base}}docs/navigation.html' },
  'docs/heroes.html':             { section: 'Patterns',       href: '{{base}}docs/heroes.html' },
  'docs/content-blocks.html':     { section: 'Patterns',       href: '{{base}}docs/content-blocks.html' },
  'docs/footers.html':            { section: 'Patterns',       href: '{{base}}docs/footers.html' },
  'docs/page-shells.html':        { section: 'Templates',      href: '{{base}}docs/page-shells.html' },
};

function stampCurrent(navStr, rel) {
  const c = CURRENT[rel];
  if (!c) return navStr;
  let out = navStr;
  if (c.section) {
    out = out.replace(
      new RegExp('<details class="wire-doc-nav__section">(\\s*<summary class="wire-doc-nav__section-summary">' + c.section + '</summary>)'),
      '<details class="wire-doc-nav__section" open>$1'
    );
  }
  const cls = c.top ? 'wire-doc-nav__top-link' : 'wire-doc-nav__link';
  out = out.replace(
    `<a class="${cls}" href="${c.href}">`,
    `<a class="${cls} is-current" aria-current="page" href="${c.href}">`
  );
  return out;
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

  if (next !== html) { writeFileSync(abs, next); updated++; console.log('  synced   ', rel, `(base="${base}")`); }
  else { skipped++; }
}
console.log(`\nsync-nav: ${updated} updated, ${skipped} skipped, ${missing} missing`);
