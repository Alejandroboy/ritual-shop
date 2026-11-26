FROM node:22.22.3-alpine AS dependencies
ENV NODE_ENV=development
# Переопределение: docker compose build --build-arg NPM_REGISTRY=https://registry.npmjs.org
ARG NPM_REGISTRY=https://registry.npmmirror.com

# NetAngels: SSL timeout до github.com, binaries.prisma.sh, unofficial-builds.nodejs.org.
# Пакеты — npmmirror; Prisma/sharp binaries — npmmirror; headers для node-gyp — зеркало Node.
ENV PRISMA_ENGINES_MIRROR=https://registry.npmmirror.com/-/binary/prisma
ENV PRISMA_BINARIES_MIRROR=https://registry.npmmirror.com/-/binary/prisma
ENV SHARP_DIST_BASE_URL=https://npmmirror.com/mirrors/sharp-libvips/
ENV npm_config_sharp_binary_host=https://npmmirror.com/mirrors/sharp
ENV npm_config_sharp_libvips_binary_host=https://npmmirror.com/mirrors/sharp-libvips
# node-gyp на alpine иначе качает unofficial-builds.nodejs.org → ETIMEDOUT
ENV npm_config_disturl=https://npmmirror.com/mirrors/node
ENV NODEJS_ORG_MIRROR=https://npmmirror.com/mirrors/node
ENV npm_config_python=/usr/bin/python3
# Не форсируем build_from_source на ВСЕ пакеты: optional (@parcel/watcher, msgpackr-extract)
# тогда тоже лезут в gyp и валят install. Prebuild с npm; при fallback — headers с зеркала.

WORKDIR /app
RUN apk add --no-cache python3 make g++

COPY package.json yarn.lock ./
RUN yarn config set registry "${NPM_REGISTRY}" \
  && yarn config set network-timeout 600000 \
  && sed -i \
    -e "s|https://registry.yarnpkg.com|${NPM_REGISTRY}|g" \
    -e "s|https://registry.npmjs.org|${NPM_REGISTRY}|g" \
    yarn.lock \
  && yarn install --ignore-optional --network-concurrency 2

FROM node:22.22.3-alpine AS build

ENV PRISMA_ENGINES_MIRROR=https://registry.npmmirror.com/-/binary/prisma
ENV PRISMA_BINARIES_MIRROR=https://registry.npmmirror.com/-/binary/prisma
ENV npm_config_disturl=https://npmmirror.com/mirrors/node
ENV NODEJS_ORG_MIRROR=https://npmmirror.com/mirrors/node

WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

# prisma.config.ts требует DATABASE_URL, но generate к БД не подключается — фиктивное значение без пароля
RUN DATABASE_URL="postgresql://localhost:5432/build" npx prisma generate
# @nestjs/cli уже в devDependencies — не тянем с registry повторно
RUN yarn build

FROM node:22.22.3-alpine AS deploy

WORKDIR /app

ENV NODE_ENV=production
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/prisma.config.ts ./prisma.config.ts
COPY package.json yarn.lock  ./

COPY --from=build /app/dist ./dist

# runtime для sharp на alpine (prebuilt иногда требует)
RUN apk add --no-cache libc6-compat

EXPOSE 3001

ENV PORT=3001

CMD [ "node", "dist/src/main.js" ]
