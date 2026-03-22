"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  icon,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn("flex items-start justify-between mb-8", className)}
    >
      <div className="flex items-center gap-4">
        {icon && (
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-white/[0.06] to-white/[0.02] border border-border dark:border-white/[0.06]">
            {icon}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-heading font-bold tracking-wide text-foreground">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1 uppercase tracking-widest">{subtitle}</p>
          )}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </motion.div>
  );
}
