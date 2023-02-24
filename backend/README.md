# Connecto Backend

This is the backend for this project.

## Setup

Before you get started, you might want to download [pnpm](https://pnpm.io/) if you haven’t already. This project has not been tested with NPM or Yarn.

First, install dependencies:

```
pnpm install
```

Then, create a `.env` file in the root directory of the project. You can use the `.env.example` file as a template:

```
cp .env.example .env
```

You’ll want to generate random, 32-character strings for both the `SESSION_SECRET` and `JWT_SECRET` variables. You can use [this tool](https://1password.com/password-generator/) to generate those values.

Next, set up the database:

```
pnpm exec prisma db push
```

For now, we’re using a SQLite database stored locally on your machine. In the future, we’ll switch to a cloud database.

Finally, start the development server:

```
pnpm dev
```

To run tests:

```
pnpm test
```
