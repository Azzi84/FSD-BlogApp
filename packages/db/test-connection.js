import { PrismaClient } from '@prisma/client';

async function testConnection() {
  const prisma = new PrismaClient();
  
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully!');
    
    // Test a simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Database query test passed:', result);
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Full error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
