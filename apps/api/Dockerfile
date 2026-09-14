# syntax=docker/dockerfile:1

# ---------- 1. Зависимости для сборки (включая devDependencies) ----------
FROM node:22.22.3-alpine AS dependencies

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile


# ---------- 2. Сборка ----------
FROM node:22.22.3-alpine AS build

WORKDIR /app

COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

# nest берётся из node_modules/.bin — @nestjs/cli должен быть в devDependencies.
# prisma generate читает только schema.prisma, подключение к БД не требуется.
RUN npx prisma generate
RUN yarn build


# ---------- 3. Только production-зависимости ----------
FROM node:22.22.3-alpine AS prod-deps

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production


# ---------- 4. Финальный образ ----------
FROM node:22.22.3-alpine AS deploy

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

# Prisma engines под musl требуют openssl
RUN apk add --no-cache openssl

COPY --from=prod-deps /app/node_modules ./node_modules

# Сгенерированный Prisma Client кладём поверх production-зависимостей
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/node_modules/@prisma ./node_modules/@prisma

COPY --from=build /app/prisma ./prisma
COPY --from=build /app/prisma.config.ts ./prisma.config.ts
COPY --from=build /app/dist ./dist
COPY package.json yarn.lock ./

USER node

EXPOSE 3001

CMD ["node", "dist/src/main.js"]
