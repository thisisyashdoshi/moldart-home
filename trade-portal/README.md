# Moldart Trade Portal

Production-oriented Next.js App Router trade portal for buyer, seller, and internal ops workflows.

## Stack
- Next.js App Router
- TypeScript
- Tailwind CSS
- Auth.js / NextAuth credentials flow
- PostgreSQL + Prisma
- Redis + BullMQ
- MinIO (S3-compatible)
- Zod validation
- Vitest

## Local development
### 1. Copy environment file
```bash
cp .env.example .env
```

### 2. Install dependencies
```bash
npm install
```

### 3. Generate Prisma client and run migrations
```bash
npm run prisma:generate
npx prisma migrate deploy
```

### 4. Seed demo data
```bash
npm run seed
```

### 5. Run the app
```bash
npm run dev
```

### 6. Run the email worker in another terminal
```bash
npm run worker:email
```

### 7. Test
```bash
npm run typecheck
npm run lint
npm run test
```

## Docker Compose
From the repo root:
```bash
docker compose up --build
```

After the containers are up, open:
- app: http://localhost:3100/portal
- mailpit: http://localhost:8025
- minio console: http://localhost:9001
- postgres host port: 55432

## Seeded credentials
- admin@moldart.local / Portal@12345
- buyer@demo.local / Portal@12345
- seller@demo.local / Portal@12345

## Current implementation status
### Implemented now
- public auth surface only at `/portal`, `/portal/register`, `/portal/forgot-password`, `/portal/reset-password`
- protected buyer, seller, and admin route shells
- JWT-backed Auth.js credentials authentication
- role + company-aware secure session DAL
- Prisma schema for the requested trade entities
- product / RFQ / quote / order / payment / logistics / document / admin route scaffolds
- document visibility filtering
- BullMQ email queue scaffolding
- MinIO document storage scaffolding
- rate limiting utility and protected proxy routing
- state machine utilities and tests

### Next phases to deepen
- email verification completion route
- richer product creation/edit flows
- quote revision UI and PDF generation job
- order mutation workflows and granular status actions
- document upload UI + server route
- notification center and audit export
- broader authorization integration tests
