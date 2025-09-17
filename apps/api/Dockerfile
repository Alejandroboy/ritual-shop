# --- Build stage ---
FROM node:20-alpine AS build
WORKDIR /app/apps/api


# Enable Yarn via Corepack
RUN corepack enable && corepack prepare yarn@stable --activate


# Copy manifests first for better caching
COPY package.json yarn.lock .yarnrc.yml ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json

ARG PRISMA_SRC=apps/api/prisma
COPY ${PRISMA_SRC} ./apps/api/prisma


# Install deps for all workspaces
RUN yarn install --immutable


# Copy the rest of the source
COPY . .


# Build API and generate Prisma client
# NOTE: при отличающемся имени воркспейса замените "api" на своё
RUN cd apps/api \
  && npx prisma generate --schema=./prisma/schema.prisma \
  && yarn build


# --- Runtime stage ---
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production


RUN corepack enable && corepack prepare yarn@stable --activate


# Copy runtime deps and build artifacts
COPY --from=build /app /app


# entrypoint запускает миграции/сид и стартует API
COPY apps/api/docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh


VOLUME ["/uploads"]
EXPOSE 3001
ENTRYPOINT ["./docker-entrypoint.sh"]
