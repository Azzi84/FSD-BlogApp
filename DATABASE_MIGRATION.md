# Database Migration to PostgreSQL for Vercel Deployment

This project has been migrated from file-based storage to a PostgreSQL database to support Vercel deployment.

## Setup Instructions

### 1. Database Provider Options

For Vercel deployment, you'll need a PostgreSQL database. Here are some recommended providers:

- **Neon** (Recommended) - Free tier available
- **Supabase** - Free tier available  
- **PlanetScale** - MySQL-compatible but works with Prisma
- **Railway** - PostgreSQL hosting
- **Vercel Postgres** - Native Vercel integration

### 2. Environment Variables

Create a `.env.local` file in your project root with:

```bash
DATABASE_URL="postgresql://username:password@hostname:port/database?schema=public"
```

For Vercel deployment, add this environment variable in your Vercel dashboard.

### 3. Database Setup

1. **Generate Prisma Client:**
   ```bash
   cd packages/db
   npx prisma generate
   ```

2. **Run Migrations:**
   ```bash
   npx prisma migrate deploy
   ```

3. **Seed the Database (optional):**
   ```bash
   npx prisma db seed
   ```

### 4. Vercel Deployment Setup

1. In your Vercel dashboard, add the `DATABASE_URL` environment variable
2. Deploy your application
3. The database will be automatically set up during the first deployment

### 5. Local Development

For local development, you can:
- Use a local PostgreSQL instance
- Use a cloud database (same as production)
- Use Docker to run PostgreSQL locally

### Migration Changes Made

- ✅ Updated Prisma schema to use PostgreSQL
- ✅ Removed file-based storage dependencies
- ✅ Updated persistence layer to use database-only
- ✅ Updated client to require database connection
- ✅ Simplified sync operations

### Commands

```bash
# Generate Prisma client
pnpm db:generate

# Apply migrations
pnpm db:migrate

# Reset database (development only)
pnpm db:reset

# View database in Prisma Studio
pnpm db:studio
```

The application now uses PostgreSQL exclusively and is ready for Vercel deployment!
