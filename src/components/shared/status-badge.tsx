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
        className,
      )}
    >
      {(() => {
        let display = status.replace(/_/g, " ");
        if (type === "urgency" && ["low", "medium", "high", "critical"].includes(display)) {
          return `${display} priority`;
        }
        if (display === "visible") return "known";
        if (display === "partial") return "unknown";
        if (display === "active" && type !== "urgency") {
          // If the user wants to remove 'active' from secrets, we handle it where secret badges are used, 
          // but for now we just return the label.
          return display;
        }
        return display;
      })()}
    </span>
  );
}
