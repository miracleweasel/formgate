FROM node:22-slim AS base

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Install dependencies
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# Copy source
COPY . .

# Build
ARG DATABASE_URL
ARG APP_ENC_KEY
ARG AUTH_SECRET
ARG APP_URL
ARG RESEND_API_KEY
ARG EMAIL_FROM
ARG TRUSTED_PROXY
ARG LEMONSQUEEZY_API_KEY
ARG LEMONSQUEEZY_WEBHOOK_SECRET
ARG LEMONSQUEEZY_STORE_ID
ARG LEMONSQUEEZY_VARIANT_ID
ARG NEXT_PUBLIC_SENTRY_DSN
ARG NEXT_PUBLIC_PLAUSIBLE_DOMAIN

RUN pnpm build

# Copy static assets into standalone output
RUN cp -r .next/static .next/standalone/.next/static
RUN cp -r public .next/standalone/public

# Production image
FROM node:22-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

COPY --from=base /app/.next/standalone ./
COPY --from=base /app/.next/static ./.next/static
COPY --from=base /app/public ./public

EXPOSE 3000

CMD ["node", "server.js"]
