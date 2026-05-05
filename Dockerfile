# syntax=docker/dockerfile:1.6
#
# STEM Agent production image — multi-stage build.
#
# Stage 1 (builder): installs devDependencies, compiles all workspaces.
# Stage 2 (runtime): copies only built artifacts + production node_modules,
#                    runs as the non-root `node` user, uses tini as PID 1.
#
# Build: docker build -t stem-agent:latest .
# Run:   docker run --rm -p 8000:8000 --env-file .env stem-agent:latest

# -----------------------------------------------------------------------------
# Stage 1 — builder
# -----------------------------------------------------------------------------
FROM node:22-slim AS builder

WORKDIR /app

# Copy manifests first so `npm install` is cached when only sources change.
COPY package.json package-lock.json tsconfig.base.json tsconfig.json tsconfig.domains.json ./
COPY shared/package.json ./shared/
COPY packages/agent-core/package.json ./packages/agent-core/
COPY packages/caller-layer/package.json ./packages/caller-layer/
COPY packages/mcp-integration/package.json ./packages/mcp-integration/
COPY packages/mcp-server/package.json ./packages/mcp-server/
COPY packages/memory-system/package.json ./packages/memory-system/
COPY packages/standard-interface/package.json ./packages/standard-interface/

RUN npm ci --no-audit --no-fund

# Copy sources for all workspaces.
COPY shared ./shared
COPY packages ./packages
COPY domains ./domains

RUN npm run build

# Prune dev dependencies from the workspace install so the runtime stage
# can copy a slim node_modules tree.
RUN npm prune --omit=dev

# -----------------------------------------------------------------------------
# Stage 2 — runtime
# -----------------------------------------------------------------------------
FROM node:22-slim AS runtime

# tini: proper PID-1 signal handling + zombie reaping.
# curl: used by the HEALTHCHECK below.
RUN apt-get update \
    && apt-get install -y --no-install-recommends tini curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=8000 \
    LOG_LEVEL=info

# Copy built artifacts and pruned dependency tree from the builder.
COPY --from=builder --chown=node:node /app/package.json ./package.json
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/shared ./shared
COPY --from=builder --chown=node:node /app/packages ./packages
COPY --from=builder --chown=node:node /app/domains ./domains

USER node

EXPOSE 8000

HEALTHCHECK --interval=15s --timeout=5s --start-period=20s --retries=5 \
    CMD curl -sf http://localhost:${PORT}/api/v1/health || exit 1

ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["node", "packages/standard-interface/dist/index.js"]
