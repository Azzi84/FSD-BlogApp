import { PrismaClient } from '@prisma/client';

async function quickTest() {
  console.log('🔍 Testing Neon database connection...');
  console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
  
  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });
  
  const timeout = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Connection timeout after 10 seconds')), 10000);
  });
  
  try {
    await Promise.race([
      prisma.$connect(),
      timeout
    ]);
    
    console.log('✅ Connected to Neon database!');
    
    // Quick test query
    const result = await Promise.race([
      prisma.$queryRaw`SELECT current_database(), version()`,
      timeout
    ]);
    
    console.log('✅ Database info:', result);
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    
    if (error.message.includes("Can't reach database server")) {
      console.log('\n🔧 Troubleshooting tips:');
      console.log('1. Check if your Neon database is active in the console');
      console.log('2. Verify the connection string is correct');
      console.log('3. Check your internet connection');
      console.log('4. Try refreshing your Neon database (it might be sleeping)');
    }
  } finally {
    await prisma.$disconnect();
  }
}

quickTest();
