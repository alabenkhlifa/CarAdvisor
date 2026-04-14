# ---- Development ----
FROM node:20-alpine AS development
WORKDIR /app

# Copy shared types
COPY shared/ ./shared/

# Install frontend dependencies
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install

# Copy frontend source
COPY frontend/ ./frontend/

WORKDIR /app/frontend
EXPOSE 5274
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# ---- Build ----
FROM node:20-alpine AS build
WORKDIR /app

COPY shared/ ./shared/
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm ci
COPY frontend/ ./frontend/

WORKDIR /app/frontend
RUN npm run build

# ---- Production ----
FROM nginx:alpine AS production
COPY --from=build /app/frontend/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
