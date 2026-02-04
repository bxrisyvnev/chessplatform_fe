# build
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Inject Vite env at build time
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# serve
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html

# SPA routing
RUN printf 'server { \
  listen 80; \
  server_name _; \
  root /usr/share/nginx/html; \
  location / { try_files $uri $uri/ /index.html; } \
}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 80

