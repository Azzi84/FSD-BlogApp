"use client";

import { ReactNode } from "react";
import { ThemeProvider } from "./ThemeContext";

export default function ClientThemeProvider({ 
  children, 
  defaultTheme = "light" 
}: { 
  children: ReactNode,
  defaultTheme?: "light" | "dark" 
}) {
  return <ThemeProvider defaultTheme={defaultTheme}>{children}</ThemeProvider>;
}