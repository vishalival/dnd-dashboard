import React from "react";
import { cn, getStatusColor, getUrgencyColor } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  type?: "status" | "urgency";
  className?: string;
}

export function StatusBadge({
  status,
  type = "status",
  className,
}: StatusBadgeProps) {
  const colorFn = type === "urgency" ? getUrgencyColor : getStatusColor;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border capitalize",
        colorFn(status),
        className
      )}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}
