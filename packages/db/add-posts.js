import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addPosts() {
  try {
    console.log('🔄 Adding posts manually to PostgreSQL...\n');
    
    // Post 1: Boost your conversion rate
    const post1 = await prisma.post.create({
      data: {
        urlId: "boost-your-conversion-rate",
        title: "Boost your conversion rate",
        description: "Illo sint voluptas. Error voluptates culpa eligendi. \nHic vel totam vitae illo. Non aliquid explicabo necessitatibus unde. \nSed exercitationem placeat consectetur nulla deserunt vel \niusto corrupti dicta laboris incididunt.",
        content: "\n  # Title 1\n\n  Illo **sint voluptas**. Error voluptates culpa eligendi. \n  Hic vel totam vitae illo. Non aliquid explicabo necessitatibus unde. \n  Sed exercitationem placeat consectetur nulla deserunt vel \n  iusto corrupti dicta laboris incididunt.\n\n  ## Subtitle 1\n\n  Illo sint *voluptas*. Error voluptates culpa eligendi. \n  Hic vel totam vitae illo. Non aliquid explicabo necessitatibus unde. \n  Sed exercitationem placeat consectetur nulla deserunt vel \n  iusto corrupti dicta laboris incididunt.\n ... post1",
        imageUrl: "https://images.unsplash.com/photo-1496128858413-b36217c2ce36?ixlib=rb-4.0.3&auto=format&fit=crop&w=3603&q=80",
        date: new Date("2022-04-17T14:00:00.000Z"),
        category: "Node",
        tags: "Back-End,Databases",
        views: 320,
        likes: 3,
        active: true
      }
    });
    console.log(`✅ Added: ${post1.title} (ID: ${post1.id})`);
    
    // Post 2: Better front ends with Fatboy Slim
    const post2 = await prisma.post.create({
      data: {
        urlId: "better-front-ends-with-fatboy-slim",
        title: "Better front ends with Fatboy Slim",
        description: "Illo sint voluptas. Error voluptates culpa eligendi. \n       Hic vel totam vitae illo. Non aliquid explicabo necessitatibus unde. \n       Sed exercitationem placeat consectetur nulla deserunt vel \n       iusto corrupti dicta laboris incididunt.",
        content: "\n  # Title 1\n\n  Illo **sint voluptas**. Error voluptates culpa eligendi. \n  Hic vel totam vitae illo. Non aliquid explicabo necessitatibus unde. \n  Sed exercitationem placeat consectetur nulla deserunt vel \n  iusto corrupti dicta laboris incididunt.\n\n  ## Subtitle 1\n\n  Illo sint *voluptas*. Error voluptates culpa eligendi. \n  Hic vel totam vitae illo. Non aliquid explicabo necessitatibus unde. \n  Sed exercitationem placeat consectetur nulla deserunt vel \n  iusto corrupti dicta laboris incididunt.\n ... post2",
        imageUrl: "https://plus.unsplash.com/premium_photo-1661342428515-5ca8cee4385a?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.0.3",
        date: new Date("2020-03-15T13:00:00.000Z"),
        category: "React",
        tags: "Front-End,Optimisation",
        views: 10,
        likes: 1,
        active: true
      }
    });
    console.log(`✅ Added: ${post2.title} (ID: ${post2.id})`);
    
    // Post 3: No front end framework is the best
    const post3 = await prisma.post.create({
      data: {
        urlId: "no-front-end-framework-is-the-best",
        title: "No front end framework is the best",
        description: "Illw sint voluptas. Error voluptates culpa eligendi. Hic vel totam vitae illo. Non aliquid explicabo necessitatibus unde. Sed exercitationem placeat consectetur nulla deserunt vel iusto corrupti dicta laboris incididunt.",
        content: "# Title 2 Illo **sint voluptas**. Error voluptates culpa eligendi. Hic vel totam vitae illo. Non aliquid explicabo necessitatibus unde. Sed exercitationem placeat consectetur nulla deserunt vel iusto corrupti dicta laboris incididunt. ## Subtitle 1 Illo sint *voluptas*. Error voluptates culpa eligendi. Hic vel totam vitae illo. Non aliquid explicabo necessitatibus unde. Sed exercitationem placeat consectetur nulla deserunt vel iusto corrupti dicta laboris incididunt. ... post3",
        imageUrl: "https://plus.unsplash.com/premium_photo-1661517706036-a48d5fc8f2f5?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
        date: new Date("2024-12-15T13:00:00.000Z"),
        category: "React",
        tags: "Front-End,Dev Tools",
        views: 22,
        likes: 2,
        active: true
      }
    });
    console.log(`✅ Added: ${post3.title} (ID: ${post3.id})`);
    
    // Post 4: Visual Basic is the future
    const post4 = await prisma.post.create({
      data: {
        urlId: "visual-basic-is-the-future",
        title: "Visual Basic is the future",
        description: "Illo sint voluptas. Error voluptates culpa eligendi. \n       Hic vel totam vitae illo. Non aliquid explicabo necessitatibus unde. \n       Sed exercitationem placeat consectetur nulla deserunt vel \n       iusto corrupti dicta laboris incididunt.",
        content: "\n  # Title 1\n\n  Illo **sint voluptas**. Error voluptates culpa eligendi. \n  Hic vel totam vitae illo. Non aliquid explicabo necessitatibus unde. \n  Sed exercitationem placeat consectetur nulla deserunt vel \n  iusto corrupti dicta laboris incididunt.\n\n  ## Subtitle 1\n\n  Illo sint *voluptas*. Error voluptates culpa eligendi. \n  Hic vel totam vitae illo. Non aliquid explicabo necessitatibus unde. \n  Sed exercitationem placeat consectetur nulla deserunt vel \n  iusto corrupti dicta laboris incididunt.\n ... post4",
        imageUrl: "https://m.media-amazon.com/images/I/51NqEfmmBTL.jpg",
        date: new Date("2023-02-10T12:00:00.000Z"),
        category: "VB.NET",
        tags: "Back-End,Legacy",
        views: 5,
        likes: 0,
        active: true
      }
    });
    console.log(`✅ Added: ${post4.title} (ID: ${post4.id})`);
    
    // Post 5: The Godfather of Frameworks
    const post5 = await prisma.post.create({
      data: {
        urlId: "the-godfather-of-frameworks",
        title: "The Godfather of Frameworks",
        description: "Illo sint voluptas. Error voluptates culpa eligendi. \n       Hic vel totam vitae illo. Non aliquid explicabo necessitatibus unde. \n       Sed exercitationem placeat consectetur nulla deserunt vel \n       iusto corrupti dicta laboris incididunt.",
        content: "\n  # Title 1\n\n  Illo **sint voluptas**. Error voluptates culpa eligendi. \n  Hic vel totam vitae illo. Non aliquid explicabo necessitatibus unde. \n  Sed exercitationem placeat consectetur nulla deserunt vel \n  iusto corrupti dicta laboris incididunt.\n\n  ## Subtitle 1\n\n  Illo sint *voluptas*. Error voluptates culpa eligendi. \n  Hic vel totam vitae illo. Non aliquid explicabo necessitatibus unde. \n  Sed exercitationem placeat consectetur nulla deserunt vel \n  iusto corrupti dicta laboris incididunt.\n ... post5",
        imageUrl: "https://plus.unsplash.com/premium_photo-1683880255258-59e2a3e03e3e?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3",
        date: new Date("2024-11-18T11:00:00.000Z"),
        category: "Vue",
        tags: "Front-End,Performance",
        views: 15,
        likes: 1,
        active: true
      }
    });
    console.log(`✅ Added: ${post5.title} (ID: ${post5.id})`);
    
    console.log('\n🎉 All posts added successfully!');
    
    // Check final count
    const totalPosts = await prisma.post.count();
    console.log(`📊 Total posts in database: ${totalPosts}`);
    
  } catch (error) {
    console.error('❌ Error adding posts:', error.message);
    // Check if it's a duplicate key error
    if (error.code === 'P2002') {
      console.log('💡 Some posts already exist (duplicate urlId)');
    }
  } finally {
    await prisma.$disconnect();
  }
}

addPosts();
