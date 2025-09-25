FROM node:22-alpine AS base
WORKDIR /app
ENV NODE_ENV=production \
NEXT_TELEMETRY_DISABLED=1 \
CI=1


FROM base AS deps
RUN corepack enable
COPY package.json yarn.lock .yarnrc.yml* ./
#COPY .yarn/ ./.yarn/
COPY apps/web/package.json ./apps/web/
COPY apps/api/package.json ./apps/api/
RUN yarn install --immutable || yarn install


FROM deps AS build
COPY . .
# Важно: переменные окружения, нужные на этапе build, передаются через compose
RUN yarn --cwd apps/web build

RUN set -eux; \
  echo "== .next dirs =="; find /app -maxdepth 4 -type d -name .next -print; \
  ls -la /app/apps/web/.next || true


FROM base AS runtime
WORKDIR /app/apps/web
ENV NODE_ENV=production \
    PORT=3000
# Копируем артефакты билда веба
COPY --from=build /app/apps/web/.next ./.next
COPY --from=build /app/apps/web/public ./public
COPY --from=build /app/apps/web/package.json ./package.json
# (если есть next.config.* в пакете)
COPY --from=build /app/apps/web/next.config.* ./
EXPOSE 3000
CMD ["yarn","start","-p","3000"]
