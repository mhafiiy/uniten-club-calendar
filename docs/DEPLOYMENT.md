# Deployment readiness — UNITEN Club Master Calendar

## Current status
Application and database foundations exist, but the production build, authenticated end-to-end tests, Google Calendar OAuth integration, and production rollout have not been verified. Do not claim full launch readiness until the checks below pass.

## Vercel configuration
1. Import GitHub repository `mhafiiy/uniten-club-calendar` as a **separate Vercel project** from Club Treasury.
2. Set framework preset to Next.js and root directory to repository root.
3. Set environment variables for Production and Preview:
   - `NEXT_PUBLIC_SUPABASE_URL=https://eyaogzdzlhdhvecpjfbc.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` = active publishable key from Supabase dashboard → Project Settings → API Keys.
4. Deploy the `feature/cmc-foundation` branch as a preview first. Do not merge into `main` before verification.
5. Configure Supabase Auth URL settings for the exact Vercel preview and production URLs, including any required callback paths.
6. Confirm the GitHub Actions build is green and the preview passes manual tests.

## Test matrix
- Student signup/login/logout and confirmation email, if enabled.
- Unauthenticated visitors cannot read private proposals or registration records.
- Student cannot create proposals without club membership.
- Club representative can submit only their own club's drafts.
- Club representative cannot approve/reject an event.
- SRC officer can approve, reject and request changes, with reason required where appropriate.
- SRC approval fails when the proposed venue overlaps another approved event.
- Only approved proposals appear on the student calendar.
- Student can register once and cancel their own registration.
- A non-SRC user cannot invoke `cmc_review_proposal` successfully.
- Event times display correctly in Malaysia time (UTC+8).
- Google Calendar manual link opens with correct event details. Manual links do not enforce reminders.
- No sensitive secrets are exposed in client bundles.

## Membership provisioning
Only authorised administrators should provision membership rows in `cmc_club_memberships` and `cmc_src_memberships` after verifying real identities. Do not create SRC roles through self-signup or public API policies.

## Important limitations
- No capacity limit or waitlist is implemented.
- No edit-and-resubmit interface yet for `changes_requested` proposals.
- No cancellation or material-change reapproval workflow yet for approved events.
- No automatic Google Calendar sync or default reminder enforcement yet.
- Legacy `club_events` and new `cmc_event_proposals` are separate; do not migrate or publish legacy events without SRC verification.
- The development branch has no verified dependency lockfile. Generate and commit one after installing dependencies in a network-enabled environment.
- GitHub CI verifies builds; it does not replace real role-based integration tests.

## Go/no-go
Deploy a **preview** once build passes. Production launch should wait for role-based tests, membership provisioning, and completion of the mandatory SRC change-approval flow.
