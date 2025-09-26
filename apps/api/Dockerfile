FROM node:22-alpine AS dependencies
ENV NODE_ENV=development
ENV DATABASE_URL="postgresql://ritual:f8bc908e-80af-41b7-88ec-386b1bf0d31f@db:5432/ritual?schema=public"

WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install

FROM node:22-alpine AS build

WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

RUN npx prisma generate
RUN yarn global add @nestjs/cli
RUN yarn build

FROM node:22-alpine AS deploy

WORKDIR /app

ENV NODE_ENV=production
ENV DATABASE_URL="postgresql://ritual:f8bc908e-80af-41b7-88ec-386b1bf0d31f@db:5432/ritual?schema=public"

COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/node_modules/@prisma ./node_modules/@prisma
COPY package.json yarn.lock  ./

COPY --from=build /app/dist ./dist

EXPOSE 3001

ENV PORT=3001

CMD [ "node", "dist/src/main.js" ]
