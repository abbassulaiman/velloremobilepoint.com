# ── Build stage ──────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Build args injected at image build time
ARG NUXT_PUBLIC_API_BASE=http://localhost:9200/api
ARG OWNER_WHATSAPP=919790599905

ENV NUXT_PUBLIC_API_BASE=$NUXT_PUBLIC_API_BASE
ENV OWNER_WHATSAPP=$OWNER_WHATSAPP

RUN npm run build

# ── Runtime stage ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS runtime

WORKDIR /app

RUN addgroup -S vmp && adduser -S vmp -G vmp

# Nuxt output is self-contained — only copy the built output
COPY --from=builder --chown=vmp:vmp /app/.output ./.output

USER vmp

ENV NODE_ENV=production
ENV PORT=9100
ENV HOST=0.0.0.0

EXPOSE 9100

CMD ["node", ".output/server/index.mjs"]
