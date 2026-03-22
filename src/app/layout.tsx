import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "ArcMind — Dungeon Master Command Center",
  description:
    "A premium Dungeon Master operating system for campaign management, session planning, NPC tracking, and storyline orchestration.",
  openGraph: {
    title: "ArcMind — Dungeon Master Command Center",
    description:
      "A premium Dungeon Master operating system for campaign management, session planning, NPC tracking, and storyline orchestration.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "ArcMind" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ArcMind — Dungeon Master Command Center",
    description:
      "A premium Dungeon Master operating system for campaign management, session planning, NPC tracking, and storyline orchestration.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} font-sans antialiased min-h-screen bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          forcedTheme="dark"
        >
          <TooltipProvider>{children}</TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
