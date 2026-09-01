import { type HTMLAttributes } from "react"
import { cn } from "@/src/shared/utils/cn"

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean
}

function Card({ className, hover = false, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl bg-[#101520] border border-white/[0.07] p-5 shadow-lg shadow-black/20",
        hover && "transition-all duration-200 hover:border-white/[0.14] hover:shadow-black/40 hover:-translate-y-0.5",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export { Card }
