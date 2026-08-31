"use client"

import { type ReactNode } from "react"
import { cn } from "@/src/shared/utils/cn"
import { Skeleton } from "@/src/presentation/crm/components/ui/Skeleton"
import { Button } from "@/src/presentation/crm/components/ui/Button"

export interface ActivityItem {
  id: string
  type: "note" | "task" | "call" | "email" | "system"
  content: string
  date: string
  author: string
  icon?: ReactNode
}

export interface ActivityTimelineProps {
  items: ActivityItem[]
  onLoadMore?: () => void
  loading?: boolean
  className?: string
}

const typeColors: Record<string, string> = {
  note: "bg-signal-blue",
  task: "bg-amber-500",
  call: "bg-emerald-500",
  email: "bg-purple-500",
  system: "bg-ash",
}

function ActivityTimeline({
  items,
  onLoadMore,
  loading,
  className,
}: ActivityTimelineProps) {
  return (
    <div className={cn("space-y-0", className)}>
      {loading && items.length === 0
        ? Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-4 pb-6 pl-4 relative">
              <Skeleton className="h-3 w-3 rounded-full shrink-0 mt-1.5" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          ))
        : items.map((item, index) => {
            const isLast = index === items.length - 1
            return (
              <div
                key={item.id}
                className={cn(
                  "flex gap-4 pb-6 pl-4 relative",
                  !isLast && "border-l border-steel",
                  isLast && "pl-4",
                )}
              >
                <span
                  className={cn(
                    "absolute left-[-5.5px] top-1.5 h-3 w-3 rounded-full ring-2 ring-graphite",
                    typeColors[item.type] || "bg-ash",
                  )}
                />
                <div className="flex-1 pl-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-caption font-medium text-paper">
                      {item.author}
                    </span>
                    <span className="text-caption text-ash">{item.date}</span>
                  </div>
                  <p className="text-body text-paper">{item.content}</p>
                </div>
              </div>
            )
          })}
      {onLoadMore && (
        <div className="flex justify-center pt-2">
          <Button variant="ghost" size="sm" onClick={onLoadMore} disabled={loading}>
            {loading ? "Loading..." : "Load more"}
          </Button>
        </div>
      )}
    </div>
  )
}

export { ActivityTimeline }
