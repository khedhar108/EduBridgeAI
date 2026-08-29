# Where identity files live

Type: `wayfinder:research` (AFK)  
Status: **resolved**

## Question

Supabase Storage vs a separate AWS S3 product for student photo, parent ID scans, and birth-certificate PDFs?

## Resolution

**One private Files bucket. No separate S3 product.**

Bucket name: `student-documents` (private). Object path `{school_id}/{student_id}/…`. Store **paths** on `students` / a small `student_documents` table — not bytes in Postgres.

| Need | What Storage does |
| --- | --- |
| Images (photo, Aadhaar/DL scan) | `allowedMimeTypes`: `image/jpeg`, `image/png`, `image/webp`; optional image transform for display |
| PDF (passport, birth cert) | Same bucket; add `application/pdf` |
| Sensitive docs | Private bucket (default). Signed URL or authenticated `download`. Never a public URL for ID proofs |
| Size | Bucket `fileSizeLimit` 5–10MB |
| Tenant isolation | Path prefix plus RLS on `storage.objects` |
| Upsert/replace | RLS needs **INSERT + SELECT + UPDATE** (upsert fails silently with INSERT-only) |
| App split | ADR-004: `@supabase/ssr` for Storage; Drizzle owns table rows (`photo_url`, document path columns) |

Photo lives in the same private bucket (signed URL in UI). Skip a second public avatars bucket unless grilling demands CDN-public faces.

EduDatabase (`xzqxehyjkftzkllmgcwq`, `ap-south-1`) had **zero** buckets when this was researched. Create the bucket in the implementation change, not here.

S3 protocol exists *inside* Supabase Storage for tools; we do not add AWS IAM/S3 for this app.

Sources: [Storage](https://supabase.com/docs/guides/storage), [Buckets](https://supabase.com/docs/guides/storage/buckets/fundamentals), [Creating buckets / MIME](https://supabase.com/docs/guides/storage/buckets/creating-buckets), [Access control](https://supabase.com/docs/guides/storage/security/access-control), [File limits](https://supabase.com/docs/guides/storage/uploads/file-limits). MCP `storage.buckets` empty on EduDatabase.
