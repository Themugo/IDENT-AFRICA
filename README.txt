IDENT AFRICA — fixes export
============================

This folder mirrors your repo's structure. Every file here is the FINAL,
already-fixed version — just copy them into your project at the matching
path, overwriting what's there.

HOW TO APPLY
------------
1. Copy all files/folders from this zip into the root of your IDENT-AFRICA
   repo, overwriting existing files at the same paths.
2. Run:
     npm install
   (this picks up the new devDependencies: eslint, typescript-eslint,
   eslint-plugin-react-hooks, eslint-plugin-react-refresh,
   eslint-plugin-unused-imports, @eslint/js, globals)
3. Verify:
     npx tsc --noEmit      -> should be clean
     npm run lint          -> should be 0 errors (143 harmless warnings)
     npm run build         -> should succeed
4. Commit and push.

WHAT'S IN HERE
--------------
- vercel.json fix (the "version": 3 deploy-breaking bug) is NOT included
  here since you already fixed that directly on GitHub.
- eslint.config.js (new) + package.json: repairs previously-broken lint
  tooling (eslint was referenced in scripts but never installed, and
  lint:fix passed an invalid --fix flag to tsc).
- src/services/i18n/index.tsx: fixed a React hook called from plain
  utility functions (formatNumber/formatCurrency/formatDate/
  formatRelativeTime) - would have crashed the first time anything
  called them outside a component render.
- src/services/journey/context.tsx + src/services/search/context.tsx:
  fixed stale-closure bugs where memoized callbacks (useCallback) could
  silently keep operating on an old userId after it changed.
- src/components/builder/VisualItineraryBuilder.tsx: documented an
  intentional dependency-array choice so it isn't "fixed" into a bug
  later; also a minor regex cleanup.
- ~380 dead imports/vars removed across most files in src/components,
  src/services, src/content, src/data, src/context (tree-shaken out of
  the build already - pure source cleanliness, zero runtime effect).
- src/index.css + src/components/home/*: homepage typography, spacing
  and font-rendering refinements (colors untouched).
- src/components/common/Header.tsx: navbar restructured to a proper
  centered grid layout, illegible micro-text sizes bumped to a
  consistent 11-12px scale, and two off-brand colors (stock Tailwind
  emerald/amber that didn't match the site's gold/forest palette
  anywhere else) swapped for the established brand colors.

Everything here has been verified end-to-end on a fresh clone of your
repo: clean TypeScript check, clean lint, successful production build.
