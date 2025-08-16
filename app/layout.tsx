import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { Nav } from "@/components/layout/site-header";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NoteHole",
  description: "A rather simple note-taking app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className}`}
      >
        <ThemeProvider>
          <Nav />
          {children}
          <div className="h-2000"></div>
        </ThemeProvider>
      </body>
    </html>
  );
}
