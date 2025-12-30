# EVzone Backend

NestJS + Fastify + Prisma backend scaffold for EVzone.

## Requirements
- Node.js 18+
- Postgres (DigitalOcean managed)
- Redis (DigitalOcean managed)
- Kafka (DigitalOcean managed)

## Setup
1. Copy `.env.example` to `.env` and fill values.
2. Install deps: `npm install`
3. Generate Prisma client: `npm run prisma:generate`
4. Run migrations: `npm run prisma:migrate`
5. Start dev server: `npm run start:dev`

## Notes
- This scaffold uses Postgres with PostGIS available at the DB level.
- Geo fields are stored as `lat`/`lng` for now. You can add PostGIS geometry later.
- Kafka + Redis clients are initialized from env; if missing, the services will skip connection.

## API
Default base path: `/api`

Health check: `GET /api/health`

