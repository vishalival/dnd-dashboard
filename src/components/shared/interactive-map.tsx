"use client";

import React, { useRef, useState, useCallback } from "react";
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
  const imgRef = useRef<HTMLImageElement>(null);
  const [scale, setScale] = useState(initialScale);
  const [isDragging, setIsDragging] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const springConfig = { damping: 25, stiffness: 200 };
  const dx = useSpring(x, springConfig);
  const dy = useSpring(y, springConfig);

  const getDragConstraints = useCallback(() => {
    const container = containerRef.current;
    const img = imgRef.current;
    if (!container || !img) return { top: 0, right: 0, bottom: 0, left: 0 };

    const cw = container.clientWidth;
    const ch = container.clientHeight;
    const iw = img.clientWidth * scale;
    const ih = img.clientHeight * scale;

    // If image is smaller than container at current scale, don't allow dragging
    const overflowX = Math.max(0, (iw - cw) / 2);
    const overflowY = Math.max(0, (ih - ch) / 2);

    return {
      top: -overflowY,
      bottom: overflowY,
      left: -overflowX,
      right: overflowX,
    };
  }, [scale]);

  const handleZoomIn = () => setScale((s) => Math.min(s + 0.5, 4));
  const handleZoomOut = () => {
    setScale((s) => {
      const next = Math.max(s - 0.5, 0.5);
      // Snap position back within new bounds
      const container = containerRef.current;
      const img = imgRef.current;
      if (container && img) {
        const cw = container.clientWidth;
        const ch = container.clientHeight;
        const iw = img.clientWidth * next;
        const ih = img.clientHeight * next;
        const overflowX = Math.max(0, (iw - cw) / 2);
        const overflowY = Math.max(0, (ih - ch) / 2);
        x.set(Math.max(-overflowX, Math.min(overflowX, x.get())));
        y.set(Math.max(-overflowY, Math.min(overflowY, y.get())));
      }
      return next;
    });
  };
  const handleReset = () => {
    setScale(initialScale);
    x.set(0);
    y.set(0);
  };

  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current?.closest(".interactive-map-root") as HTMLElement | null;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  }, []);

  // Prevent default drag behavior on the image
  const onDragStart = (e: React.DragEvent) => e.preventDefault();

  return (
    <div className={cn("relative overflow-hidden bg-zinc-950 rounded-2xl border border-white/5 group interactive-map-root", isFullscreen && "!rounded-none !border-0", className)}>
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
          onClick={toggleFullscreen}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-white hover:bg-black/80 transition-colors"
          title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
        >
          {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
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
          dragConstraints={getDragConstraints()}
          dragElastic={0.05}
          style={{ x: dx, y: dy, scale }}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={() => setIsDragging(false)}
          className="relative transition-shadow duration-300"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imgRef}
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
