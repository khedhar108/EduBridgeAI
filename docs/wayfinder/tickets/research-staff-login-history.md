# 90-day staff login store

Type: `wayfinder:research` (AFK)  
Status: **resolved**

## Question

Can we show last 3 months of staff sign-ins from Supabase Auth, or do we need our own table?

## Resolution

**Own table.** `auth.users.last_sign_in_at` is a single timestamp (seed already writes it). Auth does not give a 90-day per-school history we can query through Drizzle.

Slice 5: `staff_sign_in_events` (`school_id`, `user_id`, `role_at_login`, `occurred_at`). Append after successful staff `signInWithPassword`. Query last 90 days for Control Hub. Do not log family-door proof. Not in slice 1.
