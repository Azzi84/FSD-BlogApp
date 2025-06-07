# Neon PostgreSQL Setup Guide

This guide will help you set up a free PostgreSQL database using Neon for your blog application.

## Step 1: Create Neon Account and Database

1. **Visit [neon.tech](https://neon.tech)**
2. **Sign up** for a free account (GitHub/Google login available)
3. **Create a new project**:
   - Project name: `blog-app` (or your preferred name)
   - Database name: `blogdb` (or keep default `neondb`)
   - Region: Select closest to your location
   - PostgreSQL version: Keep default (latest)

## Step 2: Get Connection String

1. **Navigate to your project dashboard**
2. **Go to "Connection Details"** or "Settings" → "Connection Details"
3. **Copy the connection string** - it will look like:
   ```
   postgresql://username:password@ep-xxx-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

## Step 3: Update Environment Files

Replace `REPLACE_WITH_YOUR_NEON_DATABASE_URL` in both files with your actual Neon URL:

1. **Root `.env` file**: `c:\Users\ryana\Desktop\Uni\Y5 Semester 1\FSD\assignment-2-blog-group-2-ryan-azzi\assignment-2-blog-group-2-ryan-azzi\.env`
2. **Database `.env` file**: `packages\db\.env`

## Step 4: Run Database Migration

After updating the environment files, run these commands:

```bash
# Navigate to the database package
cd packages/db

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# (Optional) Seed with initial data
npx prisma db seed
```

## Step 5: Test the Connection

```bash
# Test database connection
npx prisma db pull
```

## Step 6: Deploy to Vercel

When deploying to Vercel:

1. **Add environment variable** in Vercel dashboard:
   - Key: `DATABASE_URL`
   - Value: Your Neon connection string

2. **Deploy your application**

## Neon Features (Free Tier)

- ✅ **10 GB storage**
- ✅ **Unlimited connections**
- ✅ **Automatic backups**
- ✅ **Built-in connection pooling**
- ✅ **Perfect for Vercel deployment**
- ✅ **No hibernation** (database stays active)

## Troubleshooting

If you get connection errors:
1. Ensure the URL includes `?sslmode=require`
2. Check that the URL is correctly copied (no extra spaces)
3. Verify your Neon project is active (not paused)

## Security Notes

- Never commit your database URL to version control
- Use environment variables in production
- The URL contains credentials, keep it secure
