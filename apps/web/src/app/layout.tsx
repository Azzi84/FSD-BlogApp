// import "@repo/ui/styles.css";
import type { Metadata } from "next";
import localFont from "next/font/local";
import { cookies } from "next/headers";
import "./globals.css";
import ClientThemeProvider from "../components/Themes/ClientThemeProvider";
import { DataInitializer } from "../utils/data-initializer";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Full-Stack Blog",
  description: "Blog about full stack development",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const serverCookies = await cookies();
  const theme = serverCookies.get("theme")?.value || "light";

  return (
    <html lang="en" data-theme={theme}>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <DataInitializer />
        <ClientThemeProvider defaultTheme={theme as "light" | "dark"}>
          {children}
        </ClientThemeProvider>
      </body>
    </html>
  );
}
