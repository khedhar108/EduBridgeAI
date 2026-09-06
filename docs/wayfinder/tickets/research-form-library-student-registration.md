# Which form library for student registration

Type: `wayfinder:research` (AFK)  
Status: **resolved**

## Question

React Hook Form vs native `FormData` + Zod + `useActionState` for `/{slug}/students/new` (including file uploads)?

## Resolution

**One stack: native `FormData` + `useActionState` + Zod. Do not install React Hook Form.**

shadcn Forms is library-agnostic. Field is layout only (`FieldError` accepts Zod issues). This app already submits every action as `FormData`. Registration needs file uploads — that is FormData. The server must Zod-parse anyway.

When building: add shadcn `field` to `@repo/ui` (`FieldGroup` / `Field` / `FieldLabel` / `FieldError`). Keep existing forms as they are until touched.

RHF only if a later form is a live multi-row field array that FormData cannot express. Not this registration form.
