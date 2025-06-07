# Database Instructions

## Error: "The table `main.Post` does not exist in the current database"

If you're seeing this error, it means that your database hasn't been properly initialized. 
This can happen if you have a valid database connection but the tables haven't been created yet.

## How to Fix

Run the following command in PowerShell from the root of the project:

```powershell
pnpm init-db
```

This will:
1. Create all necessary database tables
2. Initialize them with the initial data
3. Ensure your application works correctly with both file-based storage and database storage

## If the Error Persists

If you continue to see errors after running the initialization command, you can:

1. Remove the database file and recreate it:
   ```powershell
   Remove-Item "packages\db\prisma\dev.db" -Force
   pnpm init-db
   ```

2. Check your .env file to ensure it has a correct DATABASE_URL:
   ```
   DATABASE_URL="file:./packages/db/prisma/dev.db"
   ```

3. Run the sync utility after initializing:
   ```powershell
   pnpm sync-db
   ```

## File-Based Storage

If you prefer to use only file-based storage for now, you can remove the DATABASE_URL from your .env file and restart the application. This will cause the system to automatically fall back to file-based storage only.

For more detailed information about database setup, refer to the Database Testing Guide (TESTING.md).
