FROM node:24-slim
WORKDIR /usr/src/app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN npm install -g pnpm && pnpm install --frozen-lockfile

ENV NODE_ENV="production"
COPY . .
run pnpm build

CMD [ "pnpm", "start" ]
