#!/usr/bin/env node
/* ============================================================
   token-contrast.mjs — verifies the contrast ratios that
   css/tokens.css asserts by hand are actually met.

   Parses the --gray-NN ramp and the --color-* semantic aliases
   (light :root and the [data-theme="dark"] override), resolves
   each foreground/background pairing the system uses to hex,
   computes the WCAG 2.1 contrast ratio, and asserts the floor:
     - body-text pairings clear 4.5:1 (normal text, SC 1.4.3)
     - --color-border-strong clears 3:1 (non-text UI, SC 1.4.11)

   Exits 1 on any failure. Run standalone or via the validate
   skill / manifest-integrity agent.

   Usage: node token-contrast.mjs [path/to/tokens.css]
   ============================================================ */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const tokensPath = process.argv[2] || join(root, 'css/tokens.css');

let css;
try { css = readFileSync(tokensPath, 'utf8'); }
catch { console.error(`token-contrast: cannot read ${tokensPath}`); process.exit(1); }

// --- parse ramp (only in :root) ---
const ramp = {};
for (const m of css.matchAll(/--(gray-\d+)\s*:\s*(#[0-9a-fA-F]{3,8})/g)) ramp['--' + m[1]] = m[2];

// --- parse a semantic block: --color-*: var(--gray-NN) ---
const block = (re) => {
  const m = css.match(re);
  const out = {};
  if (!m) return out;
  for (const a of m[1].matchAll(/(--color-[\w-]+)\s*:\s*var\((--gray-\d+)\)/g)) out[a[1]] = a[2];
  return out;
};
const light = block(/:root\s*\{([^}]*)\}/);
const dark = block(/\[data-theme="dark"\]\s*\{([^}]*)\}/);

// --- contrast math (WCAG 2.1) ---
const toRGB = (hex) => {
  let h = hex.slice(1);
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
};
const lin = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const lum = (hex) => { const [r, g, b] = toRGB(hex).map(lin); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const ratio = (a, b) => { const la = lum(a), lb = lum(b); const hi = Math.max(la, lb), lo = Math.min(la, lb); return (hi + 0.05) / (lo + 0.05); };

// Pairings the system intends, with their floor. Secondary text is checked
// against the base surface (where the token comments assert AA holds).
const PAIRS = [
  ['--color-text', '--color-bg', 4.5],
  ['--color-text', '--color-bg-subtle', 4.5],
  ['--color-text', '--color-bg-muted', 4.5],
  ['--color-text-muted', '--color-bg', 4.5],
  ['--color-text-muted', '--color-bg-subtle', 4.5],
  ['--color-text-subtle', '--color-bg', 4.5],
  ['--color-text-inverse', '--color-bg-inverse', 4.5],
  ['--color-border-strong', '--color-bg', 3.0],
];

const resolve = (sem, token) => ramp[sem[token]];
let failures = 0;
const rows = [];
for (const [name, sem] of [['light', light], ['dark', dark]]) {
  for (const [fg, bg, floor] of PAIRS) {
    const fHex = resolve(sem, fg), bHex = resolve(sem, bg);
    if (!fHex || !bHex) { rows.push([name, fg, bg, '—', floor, 'SKIP (unmapped)']); continue; }
    const r = ratio(fHex, bHex);
    const ok = r >= floor;
    if (!ok) failures++;
    rows.push([name, `${fg}(${fHex})`, `${bg}(${bHex})`, r.toFixed(2), floor.toFixed(1), ok ? 'pass' : 'FAIL']);
  }
}

const w = (s, n) => String(s).padEnd(n);
console.log(`token-contrast: ${tokensPath}`);
console.log(`${w('theme', 6)}${w('foreground', 34)}${w('background', 34)}${w('ratio', 7)}${w('floor', 6)}status`);
for (const [t, fg, bg, r, floor, st] of rows) console.log(`${w(t, 6)}${w(fg, 34)}${w(bg, 34)}${w(r, 7)}${w(floor, 6)}${st}`);
console.log(failures ? `\nFAIL: ${failures} pairing(s) below floor` : `\nOK: all ${rows.length} pairings clear their floor`);
process.exit(failures ? 1 : 0);
