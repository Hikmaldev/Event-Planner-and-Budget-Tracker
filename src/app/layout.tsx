import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import { Suspense } from "react";
import { SessionNav } from "@/components/layout/session-nav";
import { Skeleton } from "@/components/ui/skeleton";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Event Planner and Budget Tracker",
  description:
    "Track vendors, Rupiah budgets, pre-event checklists, and H-day timelines in one place.",
};

export const viewport: Viewport = {
  themeColor: "#3B5BDB",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <header className="border-b border-border bg-card">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
            <Link
              href="/events"
              className="type-heading-sm text-foreground hover:text-primary transition-colors"
            >
              Event Planner &amp; Budget Tracker
            </Link>
            <nav
              aria-label="Primary navigation"
              className="flex items-center gap-4 type-body"
            >
              <Link
                href="/events"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Events Dashboard
              </Link>
              <Suspense
                fallback={
                  <Skeleton className="h-8 w-24" aria-hidden="true" />
                }
              >
                <SessionNav />
              </Suspense>
            </nav>
          </div>
        </header>
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 pt-8 pb-12">
          {children}
        </main>
      </body>
    </html>
  );
}
