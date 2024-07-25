# Wallet System

## Description

The Wallet System is an application designed to manage digital wallets, handle transactions, and integrate with various authentication mechanisms. Built using NestJS and Prisma.

## Features

- User authentication and authorization
- Transaction management
- Integration with Redis for caching
- Email notifications via Nodemailer
- Swagger API documentation
- Unit and E2E testing with Jest
- Environment-based configurations

## Folder Structure

```bash
wallet-system/
├── dist/
├── node_modules/
├── prisma/
├── src/
│ ├── account/
│ ├── auth/
│ ├── common/
│ ├── configs/
│ ├── filters/
│ ├── guards/
│ ├── interceptors/
│ ├── lib/
│ ├── providers/
│ ├── redis/
│ ├── token/
│ ├── transaction/
│ ├── transfer/
│ ├── user/
│ ├── app.controller.spec.ts
│ ├── app.controller.ts
│ ├── app.module.ts
│ ├── app.service.ts
│ ├── main.ts
│ ├── prisma.service.ts
│ ├── swagger-docs.ts
├── test/
│ ├── account.e2e-spec.ts
│ ├── app.e2e-spec.ts
│ ├── auth.e2e-spec.ts
│ ├── jest-e2e.json
│ ├── transaction.e2e-spec.ts
├── .env
├── .env.test
├── package.json
├── README.md
```

## Installation

1.⁠ ⁠Clone the repository:

```bash
git clone git@github.com:osigie/wallet-system.git
cd wallet-system

```

```bash
yarn install
```

```bash

cp .env.example .env

```

```bash
docker-compose up -d

```

## Test

```bash
yarn test

```

```bash
yarn test:int
```

## API Documentation

Swagger is used for API documentation. Once the application is running, navigate to /api/docs to view the Swagger documentation.
