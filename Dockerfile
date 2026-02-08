FROM node:22-alpine AS builder

WORKDIR /app

RUN apk add --no-cache libc6-compat python3 make g++

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build
RUN npm prune --production


FROM node:22-alpine

WORKDIR /app

RUN apk add --no-cache libc6-compat

RUN addgroup -S app && adduser -S app -G app

RUN mkdir -p /app && chown -R app:app /app

COPY --from=builder --chown=app:app /app/node_modules ./node_modules
COPY --from=builder --chown=app:app /app/dist ./dist
COPY --from=builder --chown=app:app /app/package*.json ./

USER app

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "dist/main.js"]
