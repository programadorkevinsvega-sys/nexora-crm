import { type HTMLAttributes } from "react"
import { cn } from "@/src/shared/utils/cn"

export interface CardProps extends HTMLAttributes<HTMLDivElement> {}

function Card({ className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-cards)] bg-graphite p-4 rekki-inset",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export { Card }
