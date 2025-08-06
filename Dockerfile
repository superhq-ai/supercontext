
FROM oven/bun:1 as base

WORKDIR /app

COPY package.json bun.lock ./
COPY apps/web/package.json ./apps/web/
COPY apps/api/package.json ./apps/api/
COPY apps/mcp/package.json ./apps/mcp/
COPY packages/utils/package.json ./packages/utils/

RUN bun install --frozen-lockfile

COPY . .

FROM base as builder

RUN bun run build

FROM oven/bun:1-alpine as production

WORKDIR /app

COPY --from=builder /app/apps/web/dist ./apps/web/dist
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/mcp/dist ./apps/mcp/dist

COPY package.json bun.lock ./
COPY apps/web/package.json ./apps/web/
COPY apps/api/package.json ./apps/api/
COPY apps/mcp/package.json ./apps/mcp/
COPY packages/utils/package.json ./packages/utils/

RUN bun install --frozen-lockfile --production

EXPOSE 3000 3001 3002

CMD ["bun", "run", "dev"] 