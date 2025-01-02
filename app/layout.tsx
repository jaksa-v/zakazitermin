import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import Header from "@/components/header";
import { PostHogProvider } from "./posthog";
import { auth } from "@clerk/nextjs/server";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Zakazitermin",
  description: "Organize your next sport game with ease",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { orgId } = await auth();

  const navigation = [
    { name: "Browse", href: "/" },
    { name: "My reservations", href: "/my" },
  ];

  const protectedNavigation = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "My Team", href: "/team" },
  ];

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <PostHogProvider>
          <ClerkProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <Header navigation={orgId ? protectedNavigation : navigation} />
              <main className="flex-1 flex flex-col">{children}</main>
              <Toaster />
            </ThemeProvider>
          </ClerkProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}
