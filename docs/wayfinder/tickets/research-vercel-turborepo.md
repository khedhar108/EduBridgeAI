# How Vercel builds this pnpm monorepo

Type: `wayfinder:research` (AFK)  
Status: **resolved** (Vercel is staging; production remains Coolify + Hetzner)  
Map: [platform-launch.md](../platform-launch.md)

## Question

What exact Vercel project settings does `apps/edubridge` need in this Turborepo
so `development` deploys without breaking local `pnpm dev`?

## Resolution

| Setting | Value |
| --- | --- |
| Project purpose | Staging only |
| Production Branch | `development` |
| Root Directory | `apps/edubridge` |
| Install Command | Vercel automatic pnpm workspace install |
| Build Command | Vercel automatic `turbo run build` (root filter inferred) |
| Framework | Next.js (app: `apps/edubridge`) |
| Node.js | 22.x |
| Package manager | Root `packageManager` (`pnpm@9.15.4`) |
| Output directory | Framework default |

`transpilePackages` already covers the workspace packages used by the app.
Vercel does not need Next standalone output or a Dockerfile. No `vercel.json` is
required while these project settings remain explicit in the dashboard.

Do not run `pnpm db:migrate` in the Vercel build. Environment names and isolation
requirements live in
[deployment-environments.md](../../architecture/deployment-environments.md).
Wildcard staging is not a Pro-only SKU — see that doc’s **Plan and capacity**.

## Blocked by

None.

## Close when

Resolved above. [Create Vercel project and env](./task-vercel-project-and-env.md)
can proceed as a human-in-the-loop staging task.
