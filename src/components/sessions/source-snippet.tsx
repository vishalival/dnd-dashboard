"use client";

import React from "react";
import { Info } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

interface SourceSnippetProps {
  source?: string;
  children: React.ReactNode;
}

export function SourceSnippet({ source, children }: SourceSnippetProps) {
  if (!source) {
    return <>{children}</>;
  }

  return (
    <span className="inline-flex items-start gap-1.5">
      <span className="flex-1">{children}</span>
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="mt-0.5 shrink-0 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
          >
            <Info className="h-3 w-3" />
          </button>
        </PopoverTrigger>
        <PopoverContent side="top" className="text-xs">
          <p className="text-muted-foreground mb-1 font-medium">From outline:</p>
          <blockquote className="border-l-2 border-amber-500/40 pl-2 text-zinc-300 italic">
            &ldquo;{source}&rdquo;
          </blockquote>
        </PopoverContent>
      </Popover>
    </span>
  );
}
