import { type HTMLAttributes } from "react"
import { cn } from "@/src/shared/utils/cn"

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {}

function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-iron/60", className)}
      {...props}
    />
  )
}

export { Skeleton }
