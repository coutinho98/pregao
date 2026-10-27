# Build context: repository root (the API depends on packages/shared).
FROM node:22-alpine
RUN corepack enable
WORKDIR /repo

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY packages/shared packages/shared
COPY apps/api apps/api
RUN pnpm install --frozen-lockfile --filter @pregao/api... \
  && pnpm --filter @pregao/api build \
  && pnpm prune --prod --ignore-scripts \
  && rm -rf /root/.local/share/pnpm /root/.cache/pnpm /root/.cache/swc-native-0

WORKDIR /repo/apps/api
ENV NODE_ENV=production
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s \
  CMD wget -qO- http://127.0.0.1:${PORT:-3000}/health || exit 1
CMD ["pnpm", "start:migrate"]
