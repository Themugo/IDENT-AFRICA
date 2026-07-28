Registration persistence fix (server.ts, src/auth/index.ts)
==============================================================

Same rationale as the schema.sql fix earlier: your repo is being
actively developed elsewhere in parallel, so this is a small, targeted
export of exactly the two files that changed, not a whole-repo zip.

WHAT WAS BROKEN
----------------
POST /api/auth/register constructed a user object, issued a valid
token for it, and returned - the user was never stored anywhere.
GET /api/auth/me with that exact token always returned 404, since it
only checked a fixed 3-user DEMO_USERS list. A real person could
register, receive a token, and then have no functioning account.

THE FIX
-------
No live database exists to persist to, so this adds a bounded, honest
fix: an in-memory registered-user store in src/auth/index.ts,
documented clearly as not surviving a restart (a real limitation, not
hidden - replace with real database-backed storage once one exists).

- registerUser() stores a bcrypt-hashed password alongside the user.
- isEmailTaken() checks both DEMO_USERS and the new store; register
  now returns 409 for a duplicate email instead of silently allowing
  it.
- findUserByCredentials() is now async, checks the registered-user
  store first (verifying via bcrypt), falls back to the existing
  demo123 path for the 3 seeded demo accounts.
- findRegisteredUserById() backs /api/auth/me for real registered
  users, alongside the existing DEMO_USERS lookup.

VERIFIED LIVE, END TO END
--------------------------
Ran the actual built server and tested the real flow:
1. Registered a brand-new user -> success, token issued
2. Called /api/auth/me with that token -> got the real user back
   (previously always 404)
3. Re-registered the same email -> correctly rejected, 409
4. Logged in with the just-registered credentials -> succeeded
5. Logged in with a wrong password for that account -> correctly
   rejected, 401
6. Existing demo login (kamauwamakena@gmail.com / demo123) -> still
   works, unaffected

Also verified: tsc --noEmit clean, eslint clean (0 errors, same
pre-existing 158 harmless warnings), full build succeeds.

HOW TO APPLY
------------
Copy server.ts and src/auth/index.ts into your repo root (matching
paths), overwriting the existing ones. No new dependencies - bcrypt
and express-rate-limit were both already in package.json.
