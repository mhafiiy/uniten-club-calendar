# UNITEN Club Master Calendar

UNITEN club scheduling with mandatory SRC approval, student event registration, and optional Google Calendar links.

## Implementation status (16 November 2026)
The `feature/cmc-foundation` branch contains a Next.js/TypeScript application with:
- Supabase email/password signup and login
- Club representative event submission and requested-revision resubmission
- SRC review dashboard (approve, reject, request changes)
- Student-facing approved-event list and registration/cancellation
- Manual Add to Google Calendar links
- Database-enforced role checks, RLS, audit records and same-venue approval clash protection
- GitHub Actions build workflow

The Supabase schema changes were applied to the dedicated `uniten-club-calendar` project. The repository `main` branch is unchanged; see [draft PR #1](https://github.com/mhafiiy/uniten-club-calendar/pull/1).

**Not production ready:** CI build result and authenticated integration tests have not been verified. Role provisioning, approved-event modification/reapproval, capacity limits, event cancellations, and automatic Google Calendar sync remain incomplete. Manual calendar links do not guarantee reminders.

## Setup
1. Run `npm install` using Node.js 22.
2. Copy `.env.example` to `.env.local` and enter the active Supabase publishable key.
3. Run `npm run dev`.
4. In Supabase Auth settings, configure the permitted site and redirect URLs.
5. Provision club representative and SRC memberships only after an administrator verifies identities.

## Google Calendar reminder defaults (automatic sync — planned)
7 days (10080 minutes), 24 hours (1440 minutes), and 1 hour (60 minutes) before the event. Students must explicitly authorise Google Calendar sync. Manual links cannot set these reminders automatically.

## Documentation
- [Architecture](docs/ARCHITECTURE.md)
- [Calendar integration](docs/GOOGLE_CALENDAR.md)
- [Applied database foundation](docs/DATABASE_IMPLEMENTATION.md)
- [Deployment checklist](docs/DEPLOYMENT.md)
