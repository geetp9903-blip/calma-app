import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Calma",
  description: "Clarity in motion.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(inter.className, "antialiased bg-gray-50 dark:bg-black min-h-screen")}>
        <main className="max-w-md mx-auto min-h-screen bg-background text-foreground shadow-2xl relative overflow-hidden">
          {children}
        </main>
      </body>
    </html>
  );
}
