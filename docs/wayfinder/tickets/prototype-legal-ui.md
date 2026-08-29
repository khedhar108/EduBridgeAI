# Prototype footer, banner, checkbox

Type: `wayfinder:prototype` (HITL)  
Status: **resolved** (shipped)

## Question

How should the marketing footer, cookie banner (Necessary / Accept all), and login Terms checkbox look and behave?

## Resolution

- Footer: `features/legal` `SiteFooter` on home, modules, blog, legal pages.
- Cookie banner: Necessary only vs Accept all; honest that optional pixels do not exist yet.
- Terms checkbox: unchecked, required, versioned; returning users with a matching consent cookie may continue without a second tick (including remember-me auto-submit).
