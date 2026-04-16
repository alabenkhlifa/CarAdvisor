# ---- Development ----
FROM node:20-alpine AS development
WORKDIR /app

# Copy shared types
COPY shared/ ./shared/

# Install backend dependencies
COPY backend/package*.json ./backend/
RUN cd backend && npm install

# Copy backend source
COPY backend/ ./backend/

WORKDIR /app/backend
CMD ["npm", "run", "start:dev"]

# ---- Build ----
FROM node:20-alpine AS build
WORKDIR /app

COPY shared/ ./shared/
COPY backend/package*.json ./backend/
RUN cd backend && npm ci
COPY backend/ ./backend/

WORKDIR /app/backend
RUN npm run build

# ---- Production ----
FROM node:20-alpine AS production
WORKDIR /app

COPY --from=build --chown=node:node /app/shared ./shared
COPY --from=build --chown=node:node /app/backend/dist ./backend/dist
COPY --from=build --chown=node:node /app/backend/node_modules ./backend/node_modules
COPY --from=build --chown=node:node /app/backend/package.json ./backend/package.json

WORKDIR /app/backend
USER node
CMD ["node", "dist/main.js"]
