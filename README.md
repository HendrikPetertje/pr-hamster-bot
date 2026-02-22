![pr-hamster-app](docs/hamster-banner.png)

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

# Commands

This hamster bot will react to various different user-provided commands (in
comments), based on these commands certain actions are performed. 

Actions involving AI summarization and code generation are performed using the
OpenAI API, so an API key is required to use those features (if you are running
this server). In the target repos where this code is running configuration files
should exist to instruct the AI how to do its work.

## Commands available
### Squash merge

Command:
```
/squash-merge
optional note-test here
```

Configuration file:
```
.github/pr-hamster-app/squash-merge.md
```
