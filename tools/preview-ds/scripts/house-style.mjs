#!/usr/bin/env node
/* ============================================================
   house-style.mjs — PostToolUse guard for Preview house style.

   Fires after Write/Edit. Re-reads the written file and enforces
   the deterministic half of the CLAUDE.md validation checklist:
     - no inline style= attributes (HTML)
     - no raw color literals (CSS), except in tokens.css / clients/
     - no doc-chrome (wire-doc-* / wire-status-pill) on client pages

   On a violation it writes a located report to stderr and exits 2,
   which feeds the report back so the fix happens in-loop.

   Shared with the `validate` skill, which runs it over a page set.
   Scoped to .html/.css so it stays fast. Whole-file check (not diff
   aware) — acceptable because the repo is already token-only; a hit
   is a real violation. Known edge: an all-hex id selector (#abc) in
   CSS reads as a color; vanishingly rare here.
   ============================================================ */
import { readFileSync } from 'node:fs';
import { resolve, relative, sep } from 'node:path';

const readStdin = () => { try { return readFileSync(0, 'utf8'); } catch { return ''; } };

// Dual-mode: as a hook it reads the tool-call JSON on stdin; as a CLI lint
// (used by the validate skill) it takes a file path as argv[2].
const cliFile = process.argv[2];
let data = {};
if (!cliFile) { try { data = JSON.parse(readStdin() || '{}'); } catch { process.exit(0); } }

const filePath = cliFile || data?.tool_input?.file_path;
if (!filePath) process.exit(0);

const lower = filePath.toLowerCase();
const isHtml = lower.endsWith('.html');
const isCss = lower.endsWith('.css');
if (!isHtml && !isCss) process.exit(0);

const projectDir = process.env.CLAUDE_PROJECT_DIR || data.cwd || process.cwd();
const abs = resolve(filePath);
const rel = relative(projectDir, abs).split(sep).join('/');

let content;
try { content = readFileSync(abs, 'utf8'); } catch { process.exit(0); }

const colorAllowed = rel === 'css/tokens.css' || /^css\/clients\//.test(rel);
const isClientPage = /^projects\//.test(rel);
const COLOR_RE = /#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?)\s*\(/;

const violations = [];
content.split(/\r?\n/).forEach((line, i) => {
  const at = `${rel}:${i + 1}`;
  if (isCss && !colorAllowed && COLOR_RE.test(line)) {
    violations.push(`  ${at}  raw color literal — reference a var(--color-*) token (css/tokens.css is the only home for raw values)`);
  }
  if (isHtml) {
    // Only flag color inside an inline style attribute. Token-valued inline
    // styles (e.g. style="--grid-min: 16rem") are legitimate layout primitives
    // here, and hex shown as text on the token docs pages is content, not color.
    const styleAttrs = line.match(/\sstyle\s*=\s*"[^"]*"|\sstyle\s*=\s*'[^']*'/g) || [];
    for (const sa of styleAttrs) {
      if (COLOR_RE.test(sa)) {
        violations.push(`  ${at}  color in an inline style — Preview is grayscale; remove it or use a var(--color-*) token`);
        break;
      }
    }
    if (isClientPage && /\bwire-(doc-|status-pill)/.test(line)) {
      violations.push(`  ${at}  doc-chrome on a client page — wire-doc-*/wire-status-pill is documentation furniture, not a wireframe part`);
    }
  }
});

if (violations.length) {
  process.stderr.write(
    `Preview house-style: ${violations.length} violation(s) in ${rel}\n` +
    violations.join('\n') +
    `\nFix before continuing (grayscale, tokens-only, no inline styles, no doc-chrome on client pages).\n`
  );
  process.exit(2);
}
process.exit(0);
