FROM node:22-slim AS base

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

ARG DATABASE_URL
ARG APP_ENC_KEY
ARG AUTH_SECRET
ARG APP_URL
ARG RESEND_API_KEY
ARG EMAIL_FROM
ARG TRUSTED_PROXY
ARG NEXT_PUBLIC_SENTRY_DSN
ARG NEXT_PUBLIC_PLAUSIBLE_DOMAIN

RUN pnpm build

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

EXPOSE 3000

CMD ["pnpm", "start"]
