FROM oven/bun:1 as base

WORKDIR /workspace

# Copy root package files
COPY package.json bun.lock tsconfig.json ./

# Copy workspace structure
COPY packages/ ./packages/
COPY apps/api/ ./apps/api/

WORKDIR /workspace/apps/api

RUN bun install

FROM base as builder

RUN bun run build

FROM oven/bun:1-alpine as production

WORKDIR /workspace

# Copy built files
COPY --from=builder /workspace/apps/api/dist ./apps/api/dist

# Copy package files
COPY package.json bun.lock tsconfig.json ./
COPY packages/ ./packages/
COPY apps/api/package.json ./apps/api/

WORKDIR /workspace/apps/api

RUN bun install --production

RUN addgroup -g 1001 -S nodejs
RUN adduser -S bun -u 1001

RUN chown -R bun:nodejs /workspace
USER bun

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD bun --version || exit 1

CMD ["bun", "dist/server.js"] 