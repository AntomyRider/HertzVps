# syntax=docker/dockerfile:1

# ==============================================================================
# Stage 1: Dependencies (deps)
# ==============================================================================
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# Copy package manifests and Prisma schema
COPY package.json package-lock.json* ./
COPY prisma ./prisma/
COPY prisma7.config.ts ./

# Install exact dependencies
RUN npm ci

# ==============================================================================
# Stage 2: Builder (builder)
# ==============================================================================
FROM node:22-alpine AS builder
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Provide fallback DATABASE_URL during build so Prisma client generation succeeds
ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_URL="mysql://root:root@localhost:3306/hertz_db"

# Generate Prisma Client & build Next.js standalone bundle
RUN npx prisma generate --config prisma7.config.ts
RUN npm run build

# ==============================================================================
# Stage 3: Production Runner (runner)
# ==============================================================================
FROM node:22-alpine AS runner
RUN apk add --no-cache libc6-compat openssl netcat-openbsd wget
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy public assets and standalone Next.js build output
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy Prisma schema, config, and CLI/client dependencies for startup migrations
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/prisma7.config.ts ./prisma7.config.ts
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules

# Copy entrypoint script and normalize line endings (prevents CRLF errors from Windows)
COPY --chown=nextjs:nodejs docker-entrypoint.sh /app/docker-entrypoint.sh
RUN sed -i 's/\r$//' /app/docker-entrypoint.sh && chmod +x /app/docker-entrypoint.sh

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=25s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3000/ || exit 1

ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["node", "server.js"]
