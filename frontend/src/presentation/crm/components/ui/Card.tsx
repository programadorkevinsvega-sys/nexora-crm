import { type HTMLAttributes } from "react"
import { cn } from "@/src/shared/utils/cn"

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean
  elevated?: boolean
}

function Card({ className, hover = false, elevated = false, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-[12px] p-6 transition-colors duration-150",
        elevated
          ? "bg-secondary text-secondary-foreground border border-border shadow-xs"
          : "bg-card text-card-foreground border border-border shadow-xs",
        hover && "hover:bg-accent hover:border-border/80 cursor-pointer",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export { Card }
