FROM node:20-alpine AS builder

WORKDIR /app

RUN apk add --no-cache openssl

COPY package.json package-lock.json ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/

RUN npm ci --workspace=backend --include-workspace-root

COPY backend/prisma ./backend/prisma
RUN npx prisma generate --schema=backend/prisma/schema.prisma

COPY backend ./backend
RUN npm run build:backend

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

RUN apk add --no-cache openssl

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/backend/package.json ./backend/package.json
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/prisma ./backend/prisma
COPY --from=builder /app/backend/public ./backend/public

WORKDIR /app/backend

EXPOSE 8000

CMD ["sh", "-c", "../node_modules/.bin/prisma migrate deploy && node dist/main.js"]
