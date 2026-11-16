FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
COPY frontend/package.json ./frontend/
COPY backend/package.json ./backend/

RUN npm ci --workspace=frontend --include-workspace-root

COPY frontend ./frontend

ARG VITE_TEST_MODE=false
ARG VITE_BACKEND_URL=/api
ARG VITE_BACKEND_URL_LOCAL=/api
ARG VITE_TELEGRAM_WEB_APP_URL=https://t.me

ENV VITE_TEST_MODE=${VITE_TEST_MODE} \
    VITE_BACKEND_URL=${VITE_BACKEND_URL} \
    VITE_BACKEND_URL_LOCAL=${VITE_BACKEND_URL_LOCAL} \
    VITE_TELEGRAM_WEB_APP_URL=${VITE_TELEGRAM_WEB_APP_URL}

RUN npm run build:frontend

FROM nginx:1.27-alpine AS runner

COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/frontend/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
