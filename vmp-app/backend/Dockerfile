# ── Build stage ──────────────────────────────────────────────────────────────
FROM node:20-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json ./
# Install only production deps
RUN npm ci --omit=dev

# ── Runtime stage ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS runtime

WORKDIR /app

# Non-root user for security
RUN addgroup -S vmp && adduser -S vmp -G vmp

# Copy installed modules and source
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN chown -R vmp:vmp /app
USER vmp

ENV NODE_ENV=production
ENV PORT=9200

EXPOSE 9200

CMD ["node", "src/app.js"]
