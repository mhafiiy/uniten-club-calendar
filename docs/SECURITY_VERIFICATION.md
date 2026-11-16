# Security verification — 17 November 2026

## Build
GitHub Actions build #20 passed before the latest database-only least-privilege migration.

## Database privilege hardening
Applied migration `cmc_least_privilege_table_grants` to the dedicated Calendar Supabase project `eyaogzdzlhdhvecpjfbc`.

The initial privilege audit found broad table grants for `anon` and `authenticated`, including `TRUNCATE`. PostgreSQL RLS does **not** protect against TRUNCATE, so these grants were revoked and replaced with the minimum permissions required by the app.

Verified via `has_table_privilege` and `has_column_privilege`:
- `anon` has no direct SELECT on event proposals.
- `authenticated` has no TRUNCATE on registrations.
- `authenticated` has no INSERT on SRC membership table.
- `authenticated` has no INSERT on registrations (registration must go through the protected RPC).
- `authenticated` has UPDATE permission on notification `read_at` only, not `user_id`.

Supabase security advisor: one INFO finding, `rls_enabled_no_policy`, for legacy `club_events`, intentionally inaccessible while old events remain unverified.

## Remaining test requirements
These checks are **not** substitutes for authenticated end-to-end tests with separate real users:
1. Create or identify verified student, club representative, and SRC test accounts.
2. Provision representative/SRC roles only through an authorised administrator.
3. Confirm cross-club isolation and inability to self-promote.
4. Verify approval/rejection, event revisions, cancellation, and in-app notifications end-to-end.
5. Verify capacity concurrency, venue conflict handling, and Malaysia-time rendering.
6. Test on a Vercel preview, then confirm production release readiness.
7. Confirm Google Calendar integration and notification delivery separately; these remain incomplete.

No production deployment or merge was performed.
