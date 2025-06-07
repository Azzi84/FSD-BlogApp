// Initialize the database by running migrations
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🗄️ Initializing database...');

try {
  // Check if the DATABASE_URL is set
  if (!process.env.DATABASE_URL) {
    console.log('Reading DATABASE_URL from .env file...');
    try {
      // Try to read from .env file if exists
      const envPath = path.resolve(__dirname, '../.env');
      if (fs.existsSync(envPath)) {
        const envFile = fs.readFileSync(envPath, 'utf8');
        const match = envFile.match(/DATABASE_URL="(.+?)"/);
        if (match) {
          process.env.DATABASE_URL = match[1];
          console.log(`Found DATABASE_URL: ${process.env.DATABASE_URL}`);
        }
      }
    } catch (err) {
      console.warn('Could not read .env file:', err.message);
    }
  }

  if (!process.env.DATABASE_URL) {
    console.warn('No DATABASE_URL environment variable found. Using default SQLite path.');
    process.env.DATABASE_URL = 'file:./packages/db/prisma/dev.db';
  }

  // Move to the db package directory
  const dbDir = path.resolve(__dirname, '../packages/db');
  
  console.log('Running Prisma migrations...');
  execSync('npx prisma migrate dev --name init', { 
    cwd: dbDir, 
    stdio: 'inherit',
    env: process.env 
  });
  
  console.log('Running database seed...');
  execSync('node -e "import(\'./dist/seed.js\').then(module => module.seed())"', { 
    cwd: dbDir, 
    stdio: 'inherit',
    env: process.env 
  });
  
  console.log('✅ Database initialized successfully!');
} catch (error) {
  console.error('❌ Error initializing database:', error.message);
  console.log('Continuing with file-based storage only.');
}
