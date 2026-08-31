"use client"

import { cn } from "@/src/shared/utils/cn"

export interface AvatarProps {
  src?: string | null
  name: string
  size?: "sm" | "md" | "lg"
  className?: string
}

const sizeMap = {
  sm: "h-7 w-7 text-[11px]",
  md: "h-9 w-9 text-xs",
  lg: "h-12 w-12 text-sm",
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
}

function stringToColor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  const hue = Math.abs(hash) % 360
  return `hsl(${hue}, 50%, 40%)`
}

function Avatar({ src, name, size = "md", className }: AvatarProps) {
  const initials = getInitials(name)
  const bgColor = stringToColor(name)

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn(
          "shrink-0 rounded-full object-cover",
          sizeMap[size],
          className,
        )}
      />
    )
  }

  return (
    <div
      className={cn(
        "shrink-0 rounded-full flex items-center justify-center font-medium text-foreground bg-iron",
        sizeMap[size],
        className,
      )}
      title={name}
      aria-label={name}
    >
      {initials}
    </div>
  )
}

export { Avatar }
