import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground",
        outline: "text-foreground",
        gold: "border-gold/30 bg-gold/10 text-amber-600 dark:text-gold-light",
        crimson: "border-crimson/30 bg-crimson/10 text-red-600 dark:text-crimson-light",
        arcane: "border-arcane/30 bg-arcane/10 text-blue-600 dark:text-arcane-light",
        emerald: "border-emerald-300 dark:border-emerald-400/30 bg-emerald-400/10 text-emerald-600 dark:text-emerald-400",
        amber: "border-amber-400/30 bg-amber-400/10 text-amber-600 dark:text-amber-400",
        purple: "border-purple-400/30 bg-purple-400/10 text-purple-600 dark:text-purple-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
