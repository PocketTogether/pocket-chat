FROM node:20-slim AS build-dist

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
ENV CI=true

WORKDIR /app

COPY ./vue3 .

RUN pnpm install
RUN pnpm build

FROM alpine

WORKDIR /app

ARG PB_VERSION=0.33.0

RUN apk add --no-cache \
    unzip \
    ca-certificates \
    bash

ADD https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_amd64.zip /tmp/pb.zip
RUN unzip /tmp/pb.zip -d /app/

COPY ./pocketbase/pb_hooks ./pb_hooks
COPY ./pocketbase/pb_migrations ./pb_migrations
COPY ./pocketbase/start_docker.sh ./start_docker.sh

COPY --from=build-dist /app/dist ./pb_public

RUN chmod +x pocketbase

EXPOSE 58090

ENTRYPOINT ["sh", "start_docker.sh"]