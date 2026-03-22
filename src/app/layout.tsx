import type { Metadata } from "next";
import { Newsreader } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-sans",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://arcmind-dnd.vercel.app"),
  title: "DarcMind — Dungeon Master Command Center",
  description:
    "A premium Dungeon Master operating system for campaign management, session planning, NPC tracking, and storyline orchestration.",
  openGraph: {
    title: "DarcMind — Dungeon Master Command Center",
    description:
      "A premium Dungeon Master operating system for campaign management, session planning, NPC tracking, and storyline orchestration.",
    images: [{ url: "/og-image-new.png", width: 1200, height: 630, alt: "DarcMind" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "DarcMind — Dungeon Master Command Center",
    description:
      "A premium Dungeon Master operating system for campaign management, session planning, NPC tracking, and storyline orchestration.",
    images: ["/og-image-new.png"],
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
        className={`${newsreader.variable} font-sans antialiased min-h-screen bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
        >
          <TooltipProvider>{children}</TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
