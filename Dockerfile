FROM node:22-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN npm install -g pnpm

# Store pnpm cache inside container, not on host
RUN pnpm config set store-dir /root/.local/share/pnpm/store

RUN pnpm install --ignore-scripts && \
    pnpm rebuild esbuild

COPY . .

EXPOSE 5000

CMD ["npx", "tsx", "watch", "src/server.ts"]