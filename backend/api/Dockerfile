# ==========================================
# Stage 1: Dependencies
# ==========================================
FROM node:24-alpine AS dependencies

RUN corepack enable

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN pnpm install --frozen-lockfile


# ==========================================
# Stage 2: Build
# ==========================================
FROM node:24-alpine AS builder

RUN corepack enable

WORKDIR /app

COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

RUN pnpm build


# ==========================================
# Stage 3: Production
# ==========================================
FROM node:24-alpine AS production

ENV NODE_ENV=production

WORKDIR /app

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN corepack enable \
    && pnpm install --prod --frozen-lockfile

COPY --from=builder /app/dist ./dist

USER appuser

EXPOSE 3000

CMD ["node", "dist/main.js"]
