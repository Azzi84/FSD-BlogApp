import { NextResponse } from "next/server";
import { loadPosts, initializeData } from "@repo/db/persistence";
import { posts } from "@repo/db/data";

export async function GET() {
  try {
    console.log("AdminApp: Initializing data...");
    
    // Force reload the posts from the central data file
    try {
      console.log("AdminApp: First attempt to load posts directly to ensure we have the latest data");
      // Try to load posts first to make sure we get the latest data
      const loaded = await loadPosts();
      if (loaded) {
        console.log(`AdminApp: Successfully loaded ${posts.length} posts directly`);
      } else {
        // If direct loading fails, try full initialization
        console.log("AdminApp: Direct loading failed, falling back to initialization");
        await initializeData();
      }
      console.log("AdminApp: Data initialization complete");
    } catch (initError) {
      console.error("AdminApp: Error during data initialization:", initError);
      console.log("AdminApp: Attempting to load posts directly as fallback...");
      await loadPosts();
    }
    
    console.log("AdminApp: Data loading complete");
    return NextResponse.json({ 
      success: true, 
      message: "Data initialized successfully" 
    });
  } catch (error) {
    console.error("AdminApp: Failed to initialize data:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to initialize data", 
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
