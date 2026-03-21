"use client";

import React from "react";
import { motion } from "framer-motion";

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <div className="p-4 rounded-2xl bg-card hover:bg-muted/60 dark:bg-white/[0.03] border border-border dark:border-white/[0.06] mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-medium text-foreground/80 dark:text-zinc-300 mb-1">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground dark:text-zinc-500 max-w-sm mb-4">
        {description}
      </p>
      {action}
    </motion.div>
  );
}
