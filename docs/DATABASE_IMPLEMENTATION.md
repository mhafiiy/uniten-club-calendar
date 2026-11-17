# SRC approval database foundation — applied 16 November 2026

Supabase project: `uniten-club-calendar` (`eyaogzdzlhdhvecpjfbc`).

Applied migrations:
- `cmc_approval_foundation`
- `cmc_approval_rpc_wrappers`

New tables: `cmc_club_memberships`, `cmc_src_memberships`, `cmc_event_proposals`, `cmc_event_reviews`. RLS is enabled on all four.

RPC functions:
- `public.cmc_submit_proposal(p_id uuid)`: owner/club member submits a draft or revised proposal.
- `public.cmc_review_proposal(p_id uuid, p_decision text, p_reason text)`: active SRC officer approves, rejects or requests changes.

The protected implementations reside in `cmc_private`, with explicit membership checks and restricted function execution. No club representatives or SRC officers have been assigned by this migration. Authorised university administrators must provision memberships separately.

**Important limitations:**
- Approval is recorded in `cmc_event_proposals`, but no public publication or student registration flow exists yet.
- Existing `club_events` is unchanged and must not be treated as SRC-approved simply because a row exists there.
- Existing `clubs` table has RLS enabled but no policy; the security advisor flagged this. Club selection will require an appropriate read policy.
- No live role-based tests or frontend build tests have been completed.
- The existing database migration history is the source of truth for the applied SQL. Do not blindly replay a migration against the same project.

Next: implement club selection policy, auth UI, membership provisioning, proposal form, SRC review dashboard, and authenticated integration tests.
