# Base
FROM node:20-alpine3.19 AS base
RUN npm install -g pnpm

# Dependencies
FROM base AS dependencies
WORKDIR /usr/src/app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install

# Build
FROM base AS build
WORKDIR /usr/src/app
COPY . .
COPY --from=dependencies /usr/src/app/node_modules ./node_modules
RUN pnpm build
RUN pnpm prune --prod

# Deploy
FROM node:20-alpine3.19 AS deploy
WORKDIR /usr/src/app
RUN npm install -g pnpm prisma
COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/package.json ./package.json
COPY --from=build /usr/src/app/prisma ./prisma
RUN pnpm prisma generate
EXPOSE 3000
CMD [ "pnpm", "start:prod" ]