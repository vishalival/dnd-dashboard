"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { Maximize2, Minimize2, ZoomIn, ZoomOut, Move } from "lucide-react";
import { cn } from "@/lib/utils";

interface InteractiveMapProps {
  src: string;
  className?: string;
  initialScale?: number;
}

export function InteractiveMap({ src, className, initialScale = 1 }: InteractiveMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(initialScale);
  const [isDragging, setIsDragging] = useState(false);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const springConfig = { damping: 25, stiffness: 200 };
  const dx = useSpring(x, springConfig);
  const dy = useSpring(y, springConfig);

  const handleZoomIn = () => setScale((s) => Math.min(s + 0.5, 4));
  const handleZoomOut = () => setScale((s) => Math.max(s - 0.5, 0.5));
  const handleReset = () => {
    setScale(initialScale);
    x.set(0);
    y.set(0);
  };

  // Prevent default drag behavior on the image
  const onDragStart = (e: React.DragEvent) => e.preventDefault();

  return (
    <div className={cn("relative overflow-hidden bg-zinc-950 rounded-2xl border border-white/5 group", className)}>
      {/* Controls Overlay */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <button
          onClick={handleZoomIn}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-white hover:bg-black/80 transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
        <button
          onClick={handleZoomOut}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-white hover:bg-black/80 transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <button
          onClick={handleReset}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-white hover:bg-black/80 transition-colors"
          title="Reset View"
        >
          <Maximize2 className="h-4 w-4" />
        </button>
      </div>

      {/* Map Hint */}
      <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/5 text-[10px] text-zinc-400 font-medium">
        <Move className="h-3 w-3" />
        Drag to explore the world
      </div>

      {/* The Map itself */}
      <div 
        ref={containerRef}
        className="w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing"
      >
        <motion.div
          drag
          dragConstraints={containerRef}
          dragElastic={0.1}
          style={{ x: dx, y: dy, scale }}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={() => setIsDragging(false)}
          className="relative transition-shadow duration-300"
        >
          <img
            src={src}
            alt="Campaign Map"
            className="max-w-none shadow-2xl rounded-sm select-none pointer-events-none"
            onDragStart={onDragStart}
          />
        </motion.div>
      </div>
    </div>
  );
}
