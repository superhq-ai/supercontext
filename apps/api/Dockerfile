FROM oven/bun:1 as base

WORKDIR /app

COPY package.json ./
COPY ../../package.json ../../bun.lock ../../
COPY ../utils/package.json ../utils/

RUN bun install --frozen-lockfile

COPY . .
COPY ../utils ../utils

FROM base as builder

RUN bun run build

FROM oven/bun:1-alpine as production

WORKDIR /app

COPY --from=builder /app/dist ./dist

COPY package.json ./
COPY ../../package.json ../../bun.lock ../../
COPY ../utils/package.json ../utils/

RUN bun install --frozen-lockfile --production

RUN addgroup -g 1001 -S nodejs
RUN adduser -S bun -u 1001

RUN chown -R bun:nodejs /app
USER bun

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD bun --version || exit 1

CMD ["bun", "dist/server.js"] 