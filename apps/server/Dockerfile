FROM node:16-slim AS builder
RUN apt-get update
RUN apt-get install -y openssl
# Set working directory
WORKDIR /app
RUN yarn global add turbo
COPY . .
RUN turbo prune --scope=@rooms2watch/server --docker

# Add lockfile and package.json's of isolated subworkspace
FROM node:16-slim AS installer

# Environment variables
ARG DATABASE_URL
ENV DATABASE_URL ${DATABASE_URL}

RUN apt-get update
RUN apt-get install -y openssl
WORKDIR /app

# First install dependencies (as they change less often)
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/yarn.lock ./yarn.lock
RUN yarn install

# Build the project and its dependencies
COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json
RUN yarn build:server


FROM node:16-slim AS runner
RUN apt-get update
RUN apt-get install -y openssl
WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 expressjs
RUN adduser --system --uid 1001 expressjs
USER expressjs
COPY --from=installer /app .

CMD node apps/server/dist/index.js