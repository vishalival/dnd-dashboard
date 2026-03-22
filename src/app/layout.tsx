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
  title: "DM Campaign Dashboard — Dungeon Master Command Center",
  description:
    "A premium Dungeon Master operating system for campaign management, session planning, NPC tracking, and storyline orchestration.",
  openGraph: {
    title: "DM Campaign Dashboard — Dungeon Master Command Center",
    description:
      "A premium Dungeon Master operating system for campaign management, session planning, NPC tracking, and storyline orchestration.",
    images: [
      {
        url: "/OG%20Image.png",
        width: 1200,
        height: 630,
        alt: "DM Campaign Dashboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DM Campaign Dashboard — Dungeon Master Command Center",
    description:
      "A premium Dungeon Master operating system for campaign management, session planning, NPC tracking, and storyline orchestration.",
    images: ["/OG%20Image.png"],
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
