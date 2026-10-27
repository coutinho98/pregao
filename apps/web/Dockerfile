# Build context: repository root (the web app depends on packages/shared).
FROM node:22-alpine AS build
RUN corepack enable
WORKDIR /repo
# Baked into the bundle at build time.
ARG VITE_API_URL=http://localhost:3000
ENV VITE_API_URL=$VITE_API_URL

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY packages/shared packages/shared
COPY apps/web apps/web
RUN pnpm install --frozen-lockfile --filter @pregao/web... \
  && pnpm --filter @pregao/web build

FROM nginx:1.27-alpine
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /repo/apps/web/dist /usr/share/nginx/html
EXPOSE 80
