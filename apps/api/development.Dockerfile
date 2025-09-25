FROM node:22-alpine
ENV NODE_ENV=development
ENV DATABASE_URL="postgresql://ritual:f8bc908e-80af-41b7-88ec-386b1bf0d31f@db:5432/ritual?schema=public"

WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install
COPY . .

RUN npx prisma generate

RUN yarn global add @nestjs/cli

EXPOSE 3001
# DEBUG: посмотреть, что видит процесс
RUN node -e "console.log('DATABASE_URL=', process.env.DATABASE_URL)"

CMD ["sh", "-c", "\
  npx prisma migrate dev --name init || true && \
  yarn --cwd apps/api dev \
"]
