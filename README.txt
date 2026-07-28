IDENT AFRICA — fixes export (v2 — built against the CURRENT main)
====================================================================

IMPORTANT: this replaces the earlier "ident-africa-fixes.zip" from
earlier in this conversation. That export was built against a version
of main (commit 4268654) that no longer exists on GitHub - your main
branch was force-pushed to a different, much larger commit history
sometime during this session. This export is built fresh against the
CURRENT main (as of this session: commit d0b2063, "World-class mobile
luxury travel experience") and verified against it directly. Do not
apply the old zip - it will not apply cleanly and isn't relevant to
what's actually on GitHub now.

WHAT WAS FOUND AND FIXED IN THIS ROUND
----------------------------------------

1. CRITICAL - server crashed on startup, every time, in the actual
   production build (server.ts). __filename/__dirname were computed
   via fileURLToPath(import.meta.url), but the build's esbuild step
   outputs CJS format, where import.meta.url is statically emptied by
   esbuild (with an explicit build warning) - fileURLToPath(undefined)
   then threw immediately. Verified by literally running the built
   server and watching it crash, then verified the fix resolves it.
   Neither variable was used anywhere else in the file - just removed
   the dead computation entirely.

2. CRITICAL - same JWT/password authentication bypass found and fixed
   earlier in this session, independently still present in this
   lineage: the token "signature" embedded the signing secret in
   plaintext-reversible base64 inside every issued token (anyone who
   obtained one token could decode it, read the secret, and forge
   tokens for any user/role including admin), and password "hashing"
   was reversible base64, not real hashing. Fixed with real
   HMAC-SHA256 signing (Node crypto, timing-safe verification) and
   real bcrypt password hashing. Verified live with a runtime smoke
   test - confirmed the secret is no longer recoverable from a token,
   tampered tokens are rejected, and bcrypt hashing round-trips
   correctly.

3. eslint.config.js already existed in this codebase but eslint itself
   was never installed as a dependency, and the lint script only ran
   tsc, never eslint - the config was completely inert. Installed the
   stack it already expected and wired it into package.json's lint
   script. This surfaced one real bug (a bare const declaration inside
   a switch case without block braces - a known JS scoping footgun,
   fixed) and auto-cleaned 79 unused imports across the files listed
   below.

4. Added graceful shutdown (SIGTERM/SIGINT) - none existed. Verified
   live: sending SIGTERM to a running server produces a clean exit
   code 0 instead of an abrupt kill. Matters especially on Render
   (the planned backend host), which sends SIGTERM on every deploy.

HOW TO APPLY
------------
1. Copy all files/folders from this zip into the root of your
   IDENT-AFRICA repo, overwriting existing files at the same paths.
2. Run: npm install
   (new devDependencies: eslint 9 + typescript-eslint +
   eslint-plugin-react-hooks/react-refresh/unused-imports + globals +
   @eslint/js)
3. Verify:
     npx tsc --noEmit   -> clean
     npm run lint        -> 0 errors, 158 harmless warnings
     npm run build        -> succeeds
     node dist/server.cjs  -> boots correctly (previously crashed
                               immediately - this is the key thing to
                               confirm)
4. Commit and push.

NOT YET DONE
------------
This was a targeted pass on the two most urgent issues (guaranteed
startup crash, auth bypass) plus lint tooling and graceful shutdown -
NOT a full re-run of the 9-report stability audit from earlier in this
session against this new, much larger codebase (20+ commits of work
this session hadn't seen before). If you want that same depth of
coverage (dead code, route audit, database schema review, performance
audit, etc.) applied to this current codebase, that's a further pass
worth doing deliberately, not something rushed into this round.
