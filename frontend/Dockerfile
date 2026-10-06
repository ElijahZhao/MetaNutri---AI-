FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
# Docker injects HOSTNAME=<container-id>, and the standalone server binds to
# process.env.HOSTNAME when set — which makes published ports unreachable.
# Pin it to 0.0.0.0 so the server listens on all interfaces.
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

# `output: 'standalone'` (see next.config.ts) emits a self-contained server with
# its own trimmed node_modules. `next start` does not work against that output —
# the supported entrypoint is the generated `server.js`. Static assets and
# `public/` are not bundled into `standalone/`, so they are copied in alongside.
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
