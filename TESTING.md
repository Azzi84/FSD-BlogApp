# Database Testing Guide

This document explains how to test the database functionality in the blog application.

## Prerequisites

1. Ensure you have set up the `.env` file with the correct `DATABASE_URL`. You can copy from `.env.example`:

```bash
# Copy the example file
cp .env.example .env
```

2. If using SQLite (default), no additional setup is needed.
3. If using a different database, make sure it's running and accessible.

## Setting Up the Database

The easiest way to set up the database is to use the initialization script:

```bash
# Run the database initialization script
pnpm init-db
```

This script will:
1. Run the necessary Prisma migrations to create database tables
2. Seed the database with initial data

Alternatively, you can run the migrations manually:

```bash
# Navigate to the db package
cd packages/db

# Run Prisma migrations
npx prisma migrate dev --name init
```

## Syncing Data

To ensure your database is in sync with your file system:

```bash
# Run the sync script
pnpm sync-db
```

## Testing Database Operations

### Creating a Post

1. Log in to the admin interface
2. Go to "Create Post"
3. Fill in the details and save
4. The post should be created in both the file system and database

### Updating a Post

1. Edit an existing post
2. Make changes and save
3. The changes should be reflected in both storage systems

### Toggling Post Status

1. Click the toggle button next to a post in the admin list
2. The status should update in both storage systems

### Deleting a Post

1. Delete a post from the admin interface
2. The post should be removed from both storage systems

## Verifying Database State

To directly check the database state:

```bash
# Navigate to the db package
cd packages/db

# Open the Prisma Studio UI
npx prisma studio
```

This will open a web interface at http://localhost:5555 where you can browse your database tables.

## Troubleshooting

### Database Connection Issues

If you're having trouble connecting to the database:

1. Check your `.env` file to ensure the `DATABASE_URL` is correct
2. Verify the database is running and accessible
3. Look for connection errors in the console

### Data Synchronization Issues

If data is inconsistent between the file system and database:

1. Run `pnpm sync-db` to force a synchronization
2. Check the console for any sync errors

### Missing Posts in Admin Interface

If posts aren't showing up in the admin interface:

1. Click the "Refresh Posts" button to trigger a sync
2. Check the browser console for any errors
