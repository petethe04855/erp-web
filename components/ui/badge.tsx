import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 select-none",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground border-border",
        // Category Badge custom styles for ERP:
        cat: "border-transparent bg-[#EDE9FE] text-[#7C3AED] dark:bg-[#7C3AED]/20 dark:text-[#A78BFA]",
        dog: "border-transparent bg-[#DBEAFE] text-[#1D4ED8] dark:bg-[#1D4ED8]/20 dark:text-[#60A5FA]",
        bundle: "border-transparent bg-[#D1FAE5] text-[#065F46] dark:bg-[#065F46]/20 dark:text-[#34D399]",
        other: "border-transparent bg-[#FEF3C7] text-[#92400E] dark:bg-[#92400E]/20 dark:text-[#FBBF24]",
        // Stock Badge custom styles:
        normal: "border-transparent bg-[#D1FAE5] text-[#059669] dark:bg-[#059669]/20 dark:text-[#34D399]",
        low: "border-transparent bg-[#FEF3C7] text-[#D97706] dark:bg-[#D97706]/20 dark:text-[#FBBF24]",
        empty: "border-transparent bg-[#FEE2E2] text-[#EF4444] dark:bg-[#EF4444]/20 dark:text-[#F87171]",
        virtual: "border-transparent bg-muted text-muted-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
