# ─────────────────────────────────────────────
# Stage 1: Install dependencies
# ─────────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app

RUN apk add --no-cache libc6-compat

COPY package.json package-lock.json* ./
RUN npm ci

# ─────────────────────────────────────────────
# Stage 2: Build the Next.js app
# ─────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

RUN apk add --no-cache libc6-compat openssl

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client for the target platform
ENV PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1
RUN node_modules/.bin/prisma generate

# Build Next.js (outputs standalone bundle)
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ─────────────────────────────────────────────
# Stage 3: Migration runner (has node_modules)
# ─────────────────────────────────────────────
FROM node:20-alpine AS migrator
WORKDIR /app

RUN apk add --no-cache libc6-compat openssl

COPY --from=deps /app/node_modules ./node_modules
COPY prisma ./prisma

# ─────────────────────────────────────────────
# Stage 4: Production runtime (minimal image)
# ─────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

RUN apk add --no-cache libc6-compat openssl

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy standalone Next.js output
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy Prisma schema + generated client
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma

# Install sharp natively in the runner for image optimization
RUN npm install sharp --ignore-scripts=false --foreground-scripts --no-save 2>/dev/null || true

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
