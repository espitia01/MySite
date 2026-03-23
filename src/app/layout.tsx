import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { Header } from "@/components/Header";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Giovanny Espitia's Notes",
  description:
    "A collection of textbook notes, paper notes, lecture summaries, and explanations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <Header />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-border py-8 text-center text-sm text-muted">
          <div className="mx-auto flex max-w-5xl flex-col items-center gap-2 px-4 sm:flex-row sm:justify-between sm:px-6">
            <span>
              &copy; {new Date().getFullYear()} Giovanny Espitia
            </span>
            <Link
              href="/admin"
              className="text-muted/50 transition-colors hover:text-muted"
            >
              Admin
            </Link>
          </div>
        </footer>
      </body>
    </html>
  );
}
