import { NextResponse } from "next/server";
import { loadPosts, initializeData } from "@repo/db/persistence";
import { posts } from "@repo/db/data";

export async function GET() {
  try {
    console.log("WebApp: Initializing data...");
    
    // Force reload the posts from the central data file
    try {
      console.log("WebApp: First attempt to load posts directly to ensure we have the latest data");
      // Try to load posts first to make sure we get the latest data
      const loaded = await loadPosts();
      if (loaded) {
        console.log(`WebApp: Successfully loaded ${posts.length} posts directly`);
      } else {
        // If direct loading fails, try full initialization
        console.log("WebApp: Direct loading failed, falling back to initialization");
        await initializeData();
      }
      console.log("WebApp: Data initialization complete");
    } catch (initError) {
      console.error("WebApp: Error during data initialization:", initError);
      console.log("WebApp: Attempting to load posts directly as fallback...");
      await loadPosts();
    }
    
    console.log("WebApp: Data loading complete");
    return NextResponse.json({ 
      success: true, 
      message: "Data initialized successfully" 
    });
  } catch (error) {
    console.error("WebApp: Failed to initialize data:", error);
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
