# STAGE 1: Dependency builder
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
# Install production dependencies only
RUN npm install --only=production

# STAGE 2: Lightweight Production Runner
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy dependencies
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./

# Copy application source code
COPY server.js index.html styles.css app.js nginx.conf ./

# Quality Audit
RUN grep -q -i "seecomerce" index.html && echo "Asset audit passed."

EXPOSE 80

CMD ["node", "server.js"]
