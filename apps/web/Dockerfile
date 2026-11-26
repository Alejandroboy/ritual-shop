FROM node:22-alpine AS build
# На RU-VPS registry.npmjs.org / yarnpkg часто тормозит (next/swc и т.п.).
# Переопределение: docker compose build --build-arg NPM_REGISTRY=https://registry.npmjs.org
ARG NPM_REGISTRY=https://registry.npmmirror.com
# next/swc и optional native — не ждать github.com (SSL timeout на NetAngels)
ENV npm_config_build_from_source=false

WORKDIR /app
COPY package.json yarn.lock ./

RUN yarn config set registry "${NPM_REGISTRY}" \
  && yarn config set network-timeout 600000 \
  && sed -i \
    -e "s|https://registry.yarnpkg.com|${NPM_REGISTRY}|g" \
    -e "s|https://registry.npmjs.org|${NPM_REGISTRY}|g" \
    yarn.lock \
  && yarn install --network-concurrency 2 --non-interactive

RUN test -x node_modules/.bin/next || (ls -la node_modules/.bin; echo "NO next" && exit 1)

COPY . .

RUN yarn build
RUN test -d /app/.next/standalone || (ls -la /app/.next && echo "NO .next/standalone" && exit 1)

RUN yarn config set registry "${NPM_REGISTRY}" \
  && yarn config set network-timeout 600000 \
  && yarn install --production --ignore-scripts --prefer-offline

FROM node:22-alpine
WORKDIR /app

WORKDIR /app
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

# Next standalone приносит сервер и все runtime-зависимости внутрь .next/standalone
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public

EXPOSE 3000
CMD ["node", "server.js"]
