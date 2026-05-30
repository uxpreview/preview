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
    'foundations/index.html', 'patterns/index.html',
    'templates/index.html', 'experiences/index.html',
  ];
  for (const f of readdirSync(join(ROOT, 'docs')).sort()) {
    if (f.endsWith('.html')) list.push('docs/' + f);
  }
  return list;
}

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

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

  // 2. Fill markers with depth-correct nav.
  const depth = rel.split('/').length - 1;
  const base = '../'.repeat(depth);
  const block = `${START}\n${nav.replace(/\{\{base\}\}/g, base)}\n${END}`;
  const region = new RegExp(esc(START) + '[\\s\\S]*?' + esc(END));
  const next = html.replace(region, block);

  if (next !== html) { writeFileSync(abs, next); updated++; console.log('  synced   ', rel, `(base="${base}")`); }
  else { skipped++; }
}
console.log(`\nsync-nav: ${updated} updated, ${skipped} skipped, ${missing} missing`);
