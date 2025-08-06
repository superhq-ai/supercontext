
FROM oven/bun:1 as base

WORKDIR /workspace/apps/web


COPY package.json bun.lock /workspace/
COPY tsconfig.json /workspace/

COPY packages /workspace/packages

COPY apps/web/package.json ./
COPY apps/web ./


RUN cd /workspace && bun install

FROM base as builder

RUN bun run build

FROM nginx:alpine as production

COPY --from=builder /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"] 