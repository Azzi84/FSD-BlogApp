# Database Migration for Vercel Deployment

This project has been migrated from file-based storage to PostgreSQL database for Vercel deployment.

## Setup for Development

1. Set up a PostgreSQL database (local or cloud)
2. Update the `DATABASE_URL` in `packages/db/.env`
3. Run migrations:
   ```bash
   cd packages/db
   npx prisma migrate dev
   npx prisma generate
   ```

## Setup for Vercel Deployment

1. Create a PostgreSQL database (recommended: Neon, Supabase, or Vercel Postgres)
2. Add `DATABASE_URL` environment variable in Vercel dashboard
3. The database will be automatically initialized on first deployment

## Database Providers for Vercel

- **Neon** (recommended): https://neon.tech
- **Supabase**: https://supabase.com
- **Vercel Postgres**: https://vercel.com/storage/postgres
- **PlanetScale**: https://planetscale.com

All providers offer free tiers suitable for development and small applications.
