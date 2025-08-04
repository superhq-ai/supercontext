
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

FROM nginx:alpine as production

COPY --from=builder /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"] 