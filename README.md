# pr-hamster-app

> A GitHub App built with [Probot](https://github.com/probot/probot) that General purpose PR app

## Setup

```sh
# Install dependencies
pnpm install

# Run the bot
pnpm start
```

## Docker

```sh
# 1. Build container
docker build -t pr-hamster-app .

# 2. Start container
docker run -e APP_ID=<app-id> -e PRIVATE_KEY=<pem-value> pr-hamster-app
```

