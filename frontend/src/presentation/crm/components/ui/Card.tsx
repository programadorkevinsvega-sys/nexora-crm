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
        "rounded-[12px] p-6",
        elevated
          ? "bg-[#161718] shadow-[rgb(35,37,42)_0px_0px_0px_1px_inset]"
          : "bg-[#0f1011] shadow-[rgb(35,37,42)_0px_0px_0px_1px_inset]",
        hover && "transition-all duration-150 hover:bg-[#161718] cursor-pointer",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export { Card }
