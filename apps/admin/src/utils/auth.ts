"use server";

import jwt from "jsonwebtoken";
import { env } from "@repo/env/admin"
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function requireAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token");
  
  if (!token) {
    redirect("/");
  }
  
  return true;
}

export async function isLoggedIn() {
  const userCookies = await cookies();

  // ASSIGNMENT 2
  // check that "auth_token" or "password" cookie exists
  // This allows tests to authenticate using the "password" cookie
  //return userCookies.has("auth_token") || userCookies.has("password");

  // ASSIGNMENT 3
  // check that auth_token cookie exists and is valid
  const token = userCookies.get("auth_token")?.value;

  if (!token) return false;
  
  try {
    return jwt.verify(token, env.JWT_SECRET || "fallback-secret-for-development") ? true : false;
  } catch (error) {
    console.error("Token verification error:", error);
    return false;
  }
}
