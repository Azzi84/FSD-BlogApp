import { NextRequest, NextResponse } from "next/server";
import { posts } from "@repo/db/data";
import { savePosts } from "@repo/db/persistence";
import { isLoggedIn } from "../../../../../utils/auth";
import { client } from "@repo/db/client";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const postId = parseInt(params.id);
  
  // Check authentication
  const isAuthenticated = await isLoggedIn();
  if (!isAuthenticated) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const postIndex = posts.findIndex((post) => post.id === postId);
    
    if (postIndex === -1) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }
    
    // Toggle the active status
    posts[postIndex].active = !posts[postIndex].active;
    const newStatus = posts[postIndex].active;
    
    // Update the database using Prisma
    try {
      const prisma = client.db;
      await prisma.post.update({
        where: { id: postId },
        data: { active: newStatus }
      });
      console.log(`Successfully updated post status in database with ID ${postId} to ${newStatus}`);
    } catch (dbError) {
      console.error(`Error updating post status in database:`, dbError);
      // Continue execution even if database update fails
    }
    
    // Persist changes to file
    try {
      await savePosts();
      console.log(`Successfully saved updated post status ID ${postId} to file`);
    } catch (saveError) {
      console.error(`Error saving updated post status ID ${postId}:`, saveError);
    }
    
    return NextResponse.json({ 
      message: "Post status toggled successfully", 
      active: newStatus
    });
  } catch (error) {
    console.error("Error toggling post status:", error);
    return NextResponse.json(
      { error: "Failed to toggle post status" }, 
      { status: 500 }
    );
  }
}