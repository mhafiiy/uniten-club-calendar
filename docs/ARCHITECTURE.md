# UNITEN Club Master Calendar — Architecture

## Purpose
Coordinate UNITEN club events, reduce scheduling and venue clashes, and improve student participation.

## Roles
- Student: view published events, register, manage own registrations and calendar preferences.
- Club representative: create and manage own club proposals; see own club registration summaries.
- SRC officer: review, approve, reject, or request changes; view university-wide scheduling.
- University administrator: manage organisations, roles, venues and policy settings. Administrative role does not bypass SRC approval.

## Mandatory SRC approval
1. Club representative submits an event proposal with title, description, start/end times, timezone, venue, capacity and target audience.
2. Backend validates the proposal and checks date/time, venue and audience overlaps. Conflicts are advisory, never automatic approval.
3. Event enters pending_src_review.
4. An authorised SRC officer approves, rejects or requests revision, with an auditable reason where appropriate.
5. Only approved events may be published or opened for registration.
6. Material changes to approved events (date, time, venue, capacity) create a new revision requiring SRC approval before becoming public.
7. Rejection and revision requests are communicated to the club representative.
8. No client-side role check is a substitute for database RLS and server-side authorisation.

## State machine
draft -> pending_src_review -> approved -> published -> completed
pending_src_review -> changes_requested -> draft
pending_src_review -> rejected
published -> cancelled
Approved event changes are submitted as separate pending revisions; the last approved version remains public until replacement is approved.

## Data model (planned)
profiles(user_id, student_id, display_name)
clubs(id, name)
club_memberships(club_id, user_id, role)
src_memberships(user_id, active)
venues(id, name, capacity)
event_proposals(id, club_id, submitted_by, status, revision, title, description, starts_at, ends_at, timezone, venue_id, capacity)
event_reviews(id, proposal_id, reviewer_id, decision, reason, created_at)
published_events(id, approved_proposal_id, status)
registrations(id, event_id, user_id, status, created_at)
calendar_connections(user_id, provider, encrypted_credentials_reference, status)
calendar_event_links(user_id, event_id, provider_event_id, sync_status)
audit_log(id, actor_id, action, entity_type, entity_id, created_at)

## Security and integrity
- Supabase Auth identifies users; never trust role values supplied by the browser.
- Row Level Security scopes club proposals to their club and registrations to their owners.
- SRC review actions require an active SRC membership verified server-side.
- Approval/publishing is performed transactionally to avoid race conditions.
- Prevent duplicate active registrations with a database uniqueness constraint.
- Capacity is checked atomically; support a waitlist later.
- Store OAuth refresh tokens securely, never in publicly readable tables or the client.
- Audit all approval decisions and significant edits.
- Protect student personal data; publish only necessary event details.

## Conflict detection
Compare half-open intervals [starts_at, ends_at). Flag overlapping venue bookings and nearby competing programmes. Display monthly event density and suggested alternatives. SRC retains final approval authority.

## Delivery sequence
1. Scaffold web application and Supabase schema.
2. Implement authentication, memberships and RLS.
3. Implement event proposals, conflict warnings, SRC review and immutable approval history.
4. Build approved-event calendar, registration and QR attendance.
5. Add Google Calendar OAuth and synchronisation.
6. Add distribution and participation analytics, tests and deployment checks.
