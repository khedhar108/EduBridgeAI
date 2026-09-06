# Build from repository root: docker build -f apps/edubridge/Dockerfile .
FROM node:22.13.0-alpine AS builder

RUN corepack enable && corepack prepare pnpm@9.15.4 --activate
WORKDIR /app

COPY . .
RUN pnpm install --frozen-lockfile

ARG APP_ENV=production
ARG WORKSPACE_ROOT_DOMAIN=edubridge.app
ARG NEXT_PUBLIC_SITE_URL=https://edubridge.app
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY

ENV APP_ENV=$APP_ENV \
    WORKSPACE_ROOT_DOMAIN=$WORKSPACE_ROOT_DOMAIN \
    NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL \
    NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY \
    NEXT_TELEMETRY_DISABLED=1

RUN pnpm build:edubridge

FROM node:22.13.0-alpine AS runner

WORKDIR /app
ENV HOSTNAME=0.0.0.0 \
    PORT=3000 \
    NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/apps/edubridge/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/edubridge/.next/static ./apps/edubridge/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/edubridge/public ./apps/edubridge/public

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/api/live').then((r)=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "apps/edubridge/server.js"]
