const { client } = require("@repo/db/client");

async function testConnection() {
  try {
    console.log("Testing database connection...");
    
    // Test a simple query
    const result = await client.safeQuery(async (prisma) => {
      return await prisma.post.findMany({
        take: 1
      });
    });
    
    console.log("✅ Database connection successful!");
    console.log("Sample result:", result);
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  }
}

testConnection();
