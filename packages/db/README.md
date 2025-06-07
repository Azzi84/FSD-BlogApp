# Database Package

This package provides database functionality for the blog application.

## Features

- **File-based Storage**: Uses JSON files for basic data persistence
- **Database Integration**: Connects to a SQL database via Prisma
- **Sync Functionality**: Maintains synchronization between the file system and database

## Usage

### Basic Data Access

```typescript
import { posts, Post } from "@repo/db/data";

// Get all posts
const allPosts = posts;

// Get a specific post
const post = posts.find(p => p.id === 1);
```

### Database Access

```typescript
import { client } from "@repo/db/client";

async function getPosts() {
  const prisma = client.db;
  const posts = await prisma.post.findMany();
  return posts;
}
```

### Synchronization

```typescript
import { syncDatabaseWithFile } from "@repo/db/sync";

// Sync data between file system and database
await syncDatabaseWithFile();
```

## Database Operations

All post editing, creation, and deletion operations are now persisted to both the file system and the database to ensure data consistency.

## Setup

1. Make sure you have a `.env` file with the `DATABASE_URL` configured
2. Run `pnpm sync-db` to initialize the database with data from the file system