# Etap 1: budowanie aplikacji
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG VITE_API_URL=/mock
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# Etap 2: serwowanie plików przez Nginx
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80