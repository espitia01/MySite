import type { Metadata } from "next";
import { Geist, Geist_Mono, Source_Serif_4 } from "next/font/google";
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

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  display: "swap",
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
      className={`${geistSans.variable} ${geistMono.variable} ${sourceSerif.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <Header />
        <main className="flex-1">{children}</main>
        <footer className="mt-8 border-t border-border/80 py-10 text-sm text-muted">
          <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 px-4 sm:flex-row sm:justify-between sm:px-6">
            <p>
              <span className="font-serif text-foreground">
                Giovanny Espitia
              </span>
              <span className="mx-2 text-border">·</span>
              Notes &amp; explanations
            </p>
            <div className="flex items-center gap-5">
              <span>&copy; {new Date().getFullYear()}</span>
              <Link
                href="/admin"
                className="text-muted/60 transition-colors hover:text-muted"
              >
                Admin
              </Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
