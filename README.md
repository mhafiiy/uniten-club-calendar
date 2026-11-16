# UNITEN Club Master Calendar

Centralised scheduling, SRC approval and student registration for UNITEN club events.

## Current status
Architecture and Google Calendar requirements have been documented on the `feature/cmc-foundation` branch. The web application, Supabase schema, authentication, approval workflow and calendar integration are **not yet implemented**.

## Core requirements
- Every club event requires explicit SRC approval before public publication or registration.
- Conflict warnings for dates, audiences and venues.
- Approved event calendar with event name, date/time and venue.
- Student registration and optional Google Calendar integration.
- Default reminders: 7 days, 24 hours and 1 hour before events.

See [Architecture](docs/ARCHITECTURE.md) and [Google Calendar specification](docs/GOOGLE_CALENDAR.md).

## Next steps
Scaffold the application, provision Supabase tables/RLS, implement SRC approval and test all role boundaries before deployment.
