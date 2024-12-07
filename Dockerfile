ARG NODE_IMAGE=node:20.11.1

# Base stage
FROM ${NODE_IMAGE} AS base

# Install dumb-init
RUN apt-get update && apt-get install -y dumb-init && apt-get clean

# Install pnpm globally
RUN npm install -g pnpm

# Set up working directory
RUN mkdir -p /home/node/app && chown node:node /home/node/app
WORKDIR /home/node/app
USER node
RUN mkdir tmp

# Dependencies stage
FROM base AS dependencies
COPY --chown=node:node ./pnpm-lock.yaml ./
COPY --chown=node:node ./package*.json ./

# Install dependencies using pnpm
RUN pnpm install

COPY --chown=node:node . .

# Build stage
FROM dependencies AS build
RUN pnpm run build

# Production stage
FROM base AS production
COPY --chown=node:node ./pnpm-lock.yaml ./
COPY --chown=node:node ./package*.json ./
RUN pnpm install --prod

COPY --chown=node:node --from=build /home/node/app/build ./

EXPOSE ${PORT}
CMD [ "dumb-init", "node", "server.js" ]