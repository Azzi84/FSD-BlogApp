import { client } from "./client.js";
import { posts } from "./data.js";

export async function seed() {
  //TODO: Uncomment below once you set up Prisma and loaded data to your database
  console.log("🌱 Seeding data");

  try {
    console.log("Connecting to database...");

    // Clear existing data
    // Using type assertion to access models
    const prisma = client.db as any;
    await prisma.comment.deleteMany();
    await prisma.like.deleteMany();
    await prisma.post.deleteMany();

    console.log("Creating posts and likes...");
    for (const post of posts) {
      // Create the post
      await prisma.post.create({
        data: {
          title: post.title,
          content: post.content,
          category: post.category,
          description: post.description,
          imageUrl: post.imageUrl,
          tags: post.tags
            .split(",")
            .map((p: string) => p.trim())
            .join(","),
          urlId: post.urlId,
          active: post.active,
          date: post.date,
          id: post.id,
          views: post.views,
        },
      });

      // Create likes for the post
      for (let i = 0; i < post.likes; i++) {
        await prisma.like.create({
          data: {
            postId: post.id,
            userIP: `192.168.100.${i}`,
          },
        });
      }

      // Create comments if they exist
      if (post.comments && post.comments.length > 0) {
        console.log(`Adding ${post.comments.length} comments for post ${post.id}`);

        for (const comment of post.comments) {
          if (!comment.parentId) {
            // Add top-level comments
            await prisma.comment.create({
              data: {
                id: comment.id,
                postId: comment.postId,
                author: comment.author,
                content: comment.content,
                date: comment.date,
                likes: comment.likes,
              },
            });
          }
        }

        // Add replies in a second pass to ensure parent comments exist
        for (const comment of post.comments) {
          if (comment.parentId) {
            await prisma.comment.create({
              data: {
                id: comment.id,
                postId: comment.postId,
                parentId: comment.parentId,
                author: comment.author,
                content: comment.content,
                date: comment.date,
                likes: comment.likes,
              },
            });
          }
        }
      }
    }

    console.log("Seeding completed successfully!");
  } catch (error) {
    console.error("Error during seeding:", error);
    throw error;
  } finally {
    // Disconnect the client to avoid hanging processes
    if (prisma && typeof prisma.$disconnect === 'function') {
      await prisma.$disconnect();
    }
  }
}
