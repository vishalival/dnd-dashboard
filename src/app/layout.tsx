import type { Metadata } from "next";
import { Inter, Cinzel } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "DM Campaign Dashboard — Dungeon Master Command Center",
  description:
    "A premium Dungeon Master operating system for campaign management, session planning, NPC tracking, and storyline orchestration.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${cinzel.variable} font-body antialiased min-h-screen bg-background`}
      >
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
