# Marketing modules

Public **blog-style** product overviews for school buyers. Not tenant workspace modules.

## Routes

| Path | What |
|------|------|
| `/modules` | Index of all articles |
| `/modules/[slug]` | One static article per module (particle-scroll shell) |

Slugs stay URL-stable (`/modules/student-dashboard`, etc.) so cards and SEO keep working.

## Content model (edit over time)

Articles are **plain serializable data** (same shape a future CMS/DB row would use):

```
modules/
├── content/<slug>.ts   # title, tagline, sections, media slots, icon key
├── content/index.ts    # registry + getModulePage / listModulePages
├── types.ts            # ModulePage DTO (JSON-safe only)
├── lib/icons.ts        # Client map: icon key → Lucide (never pass icons from RSC)
└── components/
    └── module-showcase.tsx   # Shared layout for every article
```

**Edit copy today:** change `content/<slug>.ts` and redeploy.  
**Images later:** set `hero.src` / `section.media.src` to files under `public/marketing/modules/<slug>/`.  
**CMS / DB later:** keep `ModulePage` as the DTO; swap `getModulePage` to read from Postgres without changing `ModuleShowcase`.

Do **not** put Lucide components (or any functions) on `ModulePage` — that breaks Server → Client props.

## Key files

- `components/module-showcase.tsx` — detail layout
- `content/<slug>.ts` — article body schools read
- `lib/icons.ts` — client icon resolution

## Depends on

- Marketing particle-scroll wrappers
- Public `/modules` paths in `proxy.ts`
