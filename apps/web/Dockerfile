FROM node:20-alpine AS build
WORKDIR /app


RUN corepack enable && corepack prepare yarn@stable --activate


COPY package.json yarn.lock .yarnrc.yml ./
COPY apps/web/package.json apps/web/package.json


RUN yarn install --immutable


# Вся кодовая база для сборки
COPY . .


# Если Next.js использует API_BASE на этапе билда — прокинем ARG
ARG API_BASE
ENV API_BASE=${API_BASE}


# Сборка фронта
RUN yarn workspace web build


# --- Runtime stage ---
FROM node:20-alpine AS runner
WORKDIR /app
RUN corepack enable && corepack prepare yarn@stable --activate
ENV NODE_ENV=production


COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/apps/web/package.json ./apps/web/package.json
COPY --from=build /app/apps/web/.next ./apps/web/.next
COPY --from=build /app/apps/web/public ./apps/web/public


EXPOSE 3000
CMD ["yarn", "workspace", "web", "start", "-p", "3000"]
