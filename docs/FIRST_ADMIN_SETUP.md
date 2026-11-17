# First-time administrator and role verification

## Current Calendar environment
Supabase project: `eyaogzdzlhdhvecpjfbc` (not the Treasury project).

As of 17 November 2026, `auth.users`, `cmc_src_memberships`, and `cmc_club_memberships` each contain **zero records**. Four club choices have been seeded: 3ESC, IMechE UNITEN, IET UNITEN, and SRM UNITEN.

## Bootstrap process
1. Configure the app's `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in Vercel (publishable, not service-role credentials).
2. Use the application's **Create account** flow, confirm the email if required, and sign in. Do not manually fabricate `auth.users` records.
3. Verify the intended SRC officer's identity and authorisation independently.
4. An existing trusted Supabase project administrator may look up the verified person's `auth.users.id` and grant SRC access via the SQL editor, using a reviewed, exact UUID:
   ```sql
   -- Run ONLY after confirming this UUID belongs to an authorised SRC officer.
   insert into public.cmc_src_memberships(user_id,active)
   values ('REPLACE_WITH_VERIFIED_AUTH_USER_UUID',true)
   on conflict (user_id) do update set active=true;
   ```
5. Assign club representatives only after verifying their club affiliation:
   ```sql
   -- Replace both UUIDs with independently verified IDs.
   insert into public.cmc_club_memberships(club_id,user_id,role)
   values ('REPLACE_WITH_VERIFIED_CLUB_UUID','REPLACE_WITH_VERIFIED_AUTH_USER_UUID','representative');
   ```
6. Test as three **distinct** identities: ordinary student, representative, SRC. Verify representative cannot approve; SRC cannot approve overlapping venue; ordinary student cannot submit or self-promote; event changes require SRC approval; notifications are scoped to registrants.
7. After authentication and tests, review preview deployment before production release.

Never place service-role keys in `NEXT_PUBLIC_` variables or GitHub commits. Do not use the Treasury project credentials or database.
