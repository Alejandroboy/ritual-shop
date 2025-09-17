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
RUN cd apps/api \
  && npx prisma generate --schema=./prisma/schema.prisma \
  && yarn build \
  && ( [ -f dist/main.js ] \
       || [ -f ../dist/apps/api/main.js ] \
       || (echo '❌ dist/main.js not found; tree:' && find /app -maxdepth 4 -type f -name main.js && exit 1) )


# --- Runtime stage ---
FROM node:20-alpine AS runner
WORKDIR /app/apps/api
ENV NODE_ENV=production
RUN corepack enable && corepack prepare yarn@stable --activate

# Копируем всё из build-слоя (чтобы попали /app/dist и /app/apps/api/dist)
COPY --from=build /app /app

# Entrypoint
COPY apps/api/docker-entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 3001
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
