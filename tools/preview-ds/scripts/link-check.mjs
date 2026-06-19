#!/usr/bin/env node
/* ============================================================
   link-check.mjs — verifies internal links resolve on disk.

   Crawls every *.html under the project (excluding build/vendor
   dirs), extracts local href/src refs, resolves each relative to
   its file (or to the site root for root-relative refs), and
   asserts the target exists. Keeps the "zero broken links" state
   true across the ~200 pages.

   Skips external (http, //, mailto, tel, data, javascript),
   pure-#-fragment, and templated ({{...}}) refs. Exits 1 on any
   broken link. Run standalone or via the validate skill /
   manifest-integrity agent.

   Usage: node link-check.mjs [projectRoot]
   ============================================================ */
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';

const root = process.argv[2] || process.env.CLAUDE_PROJECT_DIR || process.cwd();
const EXCLUDE = new Set(['node_modules', 'dist', '.git', 'tools', '.claude']);

const htmlFiles = [];
(function walk(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) { if (!EXCLUDE.has(e.name)) walk(join(dir, e.name)); }
    else if (e.isFile() && e.name.endsWith('.html')) htmlFiles.push(join(dir, e.name));
  }
})(root);

const isExternal = (r) =>
  /^(?:https?:)?\/\//.test(r) || /^(?:mailto:|tel:|data:|javascript:)/i.test(r) ||
  r.startsWith('#') || r.includes('{{') || /[\s'"<>{}]/.test(r) || r.trim() === '';

// Displayed code (escaped <script src="..."> samples) lives in pre/code, and
// JS string-built hrefs live in script blocks. Strip both before scanning so
// example markup is never link-checked as if it were real.
const stripCode = (html) => html
  .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
  .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
  .replace(/<pre\b[^>]*>[\s\S]*?<\/pre>/gi, '')
  .replace(/<code\b[^>]*>[\s\S]*?<\/code>/gi, '');

const broken = [];
let linkCount = 0;

for (const file of htmlFiles) {
  const html = stripCode(readFileSync(file, 'utf8'));
  const refs = new Set();
  for (const m of html.matchAll(/(?:href|src)\s*=\s*"([^"]*)"|(?:href|src)\s*=\s*'([^']*)'/g)) {
    refs.add(m[1] ?? m[2]);
  }
  for (let ref of refs) {
    if (isExternal(ref)) continue;
    ref = ref.split('#')[0].split('?')[0];
    if (!ref) continue;
    linkCount++;
    let target = ref.startsWith('/') ? join(root, ref) : resolve(dirname(file), ref);
    if (target.endsWith('/') || (existsSync(target) && statSync(target).isDirectory())) {
      target = join(target, 'index.html');
    }
    if (!existsSync(target)) {
      broken.push(`  ${file.slice(root.length + 1)}  ->  ${ref}`);
    }
  }
}

console.log(`link-check: ${htmlFiles.length} pages, ${linkCount} internal links`);
if (broken.length) {
  console.log(`\nBROKEN (${broken.length}):`);
  console.log(broken.join('\n'));
  process.exit(1);
}
console.log('OK: no broken internal links');
process.exit(0);
