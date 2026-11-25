FROM node:22.22.3-alpine AS dependencies
ENV NODE_ENV=development
# На RU-VPS registry.npmjs.org / yarnpkg часто тормозит или таймаутится.
# Переопределение: docker compose build --build-arg NPM_REGISTRY=https://registry.npmjs.org
ARG NPM_REGISTRY=https://registry.npmmirror.com

WORKDIR /app
COPY package.json yarn.lock ./
# yarn v1 качает по URL из yarn.lock (resolved) — подменяем хост зеркала
RUN yarn config set registry "${NPM_REGISTRY}" \
  && yarn config set network-timeout 600000 \
  && sed -i \
    -e "s|https://registry.yarnpkg.com|${NPM_REGISTRY}|g" \
    -e "s|https://registry.npmjs.org|${NPM_REGISTRY}|g" \
    yarn.lock \
  && yarn install

FROM node:22.22.3-alpine AS build

WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

# prisma.config.ts требует DATABASE_URL, но generate к БД не подключается — фиктивное значение без пароля
RUN DATABASE_URL="postgresql://localhost:5432/build" npx prisma generate
RUN yarn global add @nestjs/cli
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

EXPOSE 3001

ENV PORT=3001

CMD [ "node", "dist/src/main.js" ]
