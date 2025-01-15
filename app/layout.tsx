import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { PostHogProvider } from "./posthog";
import { Suspense } from "react";
import { AuthenticatedLayout } from "@/components/authenticated-layout";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
  display: "swap",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Zakazitermin",
  description: "Organize your next sport game with ease",
  appleWebApp: {
    title: "Zakazi",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta
          name="theme-color"
          content="#ffffff"
          data-dark-theme="hsl(229 41% 4%)"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased min-h-screen flex flex-col`}
      >
        <PostHogProvider>
          <ClerkProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <div className="flex min-h-screen flex-col">
                <Suspense fallback={null}>
                  <AuthenticatedLayout />
                </Suspense>
                <main className="flex-1 flex flex-col lg:pb-0">{children}</main>
              </div>
              <Toaster />
            </ThemeProvider>
          </ClerkProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}
