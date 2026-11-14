FROM node:26.13.1-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY tsconfig*.json prisma.config.ts ./
COPY prisma ./prisma
COPY src ./src
RUN npm run build
RUN npm prune --omit=dev --no-audit --no-fund

FROM node:26.13.1-bookworm-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
COPY --from=build --chown=node:node /app/prisma ./prisma
COPY --from=build --chown=node:node /app/prisma.config.ts ./prisma.config.ts
COPY --from=build --chown=node:node /app/package*.json ./
COPY --chown=node:node scripts/start.sh ./scripts/start.sh
USER node
EXPOSE 3000
CMD ["sh", "scripts/start.sh"]
