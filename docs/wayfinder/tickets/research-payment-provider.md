# Razorpay vs Stripe for India upfront billing

Type: `wayfinder:research` (AFK)  
Status: **open**  
Map: [platform-launch.md](../platform-launch.md)

## Question

For India-first schools, 3 / 6 / 12-month **upfront** billing (GST invoices), which provider should the Phase 6.4 ADR recommend: Razorpay, Stripe, or split (e.g. Razorpay now, Stripe later)? Include account-approval friction, webhooks, and what we must not build in slices A–D.

## Notes

- Phase 6: no proration in v1; states `trialing | active | grace | read_only`
- Not needed to ship host rewrite (slice C)
- Draft becomes an ADR under `docs/decisions/` only after this ticket closes and a human accepts it

## Blocked by

None.

## Close when

One recommended provider, why, and a one-line “do not implement checkout until ADR accepted.”
