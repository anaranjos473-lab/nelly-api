# Stage: deps
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Stage: dev
FROM node:20-alpine AS dev
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package*.json ./
RUN npm install -g nodemon
COPY . .
ENV NODE_ENV=development
EXPOSE 3001 9229
CMD ["nodemon", "--watch", "src", "--inspect=0.0.0.0:9229", "--legacy-watch", "src/index.js"]
