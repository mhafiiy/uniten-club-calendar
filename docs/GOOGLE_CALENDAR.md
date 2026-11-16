# Google Calendar integration specification

## Defaults
Every student who opts into automatic calendar sync starts with three popup reminders:
- 7 days before: 10080 minutes
- 24 hours before: 1440 minutes
- 1 hour before: 60 minutes

Use Asia/Kuala_Lumpur for display and event creation; store instants in UTC. Students may customise or disable reminders.

Google Calendar API event reminder payload:
```json
{
  "reminders": {
    "useDefault": false,
    "overrides": [
      { "method": "popup", "minutes": 10080 },
      { "method": "popup", "minutes": 1440 },
      { "method": "popup", "minutes": 60 }
    ]
  }
}
```

## Registration workflow
1. Registration is saved in Supabase, which is the source of truth.
2. For manual mode, show an Add to Google Calendar link (student saves it and manages notifications there).
3. For automatic mode, request explicit Google OAuth consent and minimum required Calendar scopes.
4. Create a calendar event only after registration and consent. Persist the provider event ID for idempotent updates.
5. Sync approved changes to time, venue and title; never sync unapproved proposed revisions.
6. On cancellation, notify the student and update or remove the linked calendar event according to their preferences.
7. When a registration occurs after a reminder threshold, do not send retroactive notifications.
8. Handle revoked tokens, API errors, retries and disconnects without cancelling the Supabase registration.

## Important distinction
A Google Calendar event template does not itself save an event, and manual templates cannot guarantee the three reminder defaults. Automatic reminders require authorised API access and successful event creation.
