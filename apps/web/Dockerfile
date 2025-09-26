FROM node:22-alpine AS build
WORKDIR /app
COPY package.json yarn.lock ./

RUN yarn install

COPY . .

RUN yarn build
RUN test -d /app/.next/standalone || (ls -la /app/.next && echo "NO .next/standalone" && exit 1)

RUN yarn install --production --ignore-scripts --prefer-offline

FROM node:22-alpine
WORKDIR /app

#COPY --from=build /app/package.json ./package.json
#COPY --from=build /app/node_modules ./node_modules
#COPY --from=build /app/.next ./.next
#COPY --from=build /app/public ./public
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
