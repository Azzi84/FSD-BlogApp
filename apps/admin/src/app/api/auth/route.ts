import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { env } from "@repo/env/admin";

// Hard-coded password for Assignment 2
const ADMIN_PASSWORD = "123";

// POST handler for login
export async function POST(request: NextRequest) {
  // Check content type and extract data accordingly
  const contentType = request.headers.get('content-type') || '';
  
  let password: string;
  let method: string | null = null;
  
  if (contentType.includes('application/json')) {
    // Handle JSON data
    const json = await request.json();
    password = json.password;
    method = json._method || null;
  } else {
    // Handle form data
    const formData = await request.formData();
    password = formData.get("password") as string;
    method = formData.get("_method") as string;
  }
  
  // Handle logout if _method is DELETE
  if (method === "DELETE") {
    (await cookies()).delete("auth_token");
    return NextResponse.redirect(new URL("/", request.url), {
      status: 303, // See Other
    });
  }  // Handle login
  if (password === ADMIN_PASSWORD) {
    // Generate JWT token with proper secret
    const token = jwt.sign(
      { authenticated: true },
      env.JWT_SECRET || 'fallback-secret-for-development',
      { expiresIn: '24h' }
    );
    
    // Set auth cookie with JWT token
    (await cookies()).set("auth_token", token, {
      httpOnly: true,
      path: "/",
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });
    
    return NextResponse.redirect(new URL("/", request.url), {
      status: 303, // See Other
    });
  }

  // If password is incorrect, redirect back to login with error
  return NextResponse.redirect(new URL("/?error=invalid_credentials", request.url), {
    status: 303, // See Other
  });
}

// DELETE handler for logout (keeping this for direct API calls)
export async function DELETE(request: NextRequest) {
  (await cookies()).delete("auth_token");
  
  return NextResponse.redirect(new URL("/", request.url), {
    status: 303, // See Other
  });
}