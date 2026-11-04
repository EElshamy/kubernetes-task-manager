
# Stage 1: Install dependencies
FROM node:24-alpine AS dependencies

RUN corepack enable

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN pnpm install --frozen-lockfile


# Stage 2: Build Nuxt application
FROM node:24-alpine AS builder

RUN corepack enable

WORKDIR /app

COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

RUN pnpm build


# Stage 3: Production runtime
FROM node:24-alpine AS production

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

WORKDIR /app

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=builder --chown=appuser:appgroup /app/.output ./.output

USER appuser

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]

