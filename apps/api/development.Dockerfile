FROM node:22-alpine
ENV NODE_ENV=development

WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install
COPY . .


# DATABASE_URL для запуска приходит из окружения контейнера; для generate хватает фиктивного
RUN DATABASE_URL="postgresql://localhost:5432/build" npx prisma generate

RUN yarn global add @nestjs/cli

EXPOSE 3001

CMD ["sh", "-c", "\
  npx prisma migrate dev --name init || true && \
  yarn --cwd apps/api dev \
"]
