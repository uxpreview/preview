#!/usr/bin/env node
/* ============================================================
   sync-nav.mjs — compatibility shim.

   The nav is now manifest-driven: the canonical IA lives in
   manifest.json → `nav`, and scripts/build-ia.mjs generates
   partials/nav.html, stubs missing pages, and propagates the
   nav/footer/shell into every doc-chrome page.

   This shim preserves the documented `node scripts/sync-nav.mjs`
   entry point. Prefer `node scripts/build-ia.mjs`.
   ============================================================ */
import { run } from './build-ia.mjs';
run();
