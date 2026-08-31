import { type ReactNode } from "react"
import { Inbox } from "lucide-react"
import { cn } from "@/src/shared/utils/cn"

export interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 px-4 text-center",
        className,
      )}
    >
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-[var(--radius-largecards)] bg-iron text-ash">
        {icon || <Inbox className="h-8 w-8" />}
      </div>
      <h3 className="text-heading-sm font-sans font-semibold text-paper mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-body text-ash max-w-sm mb-6">{description}</p>
      )}
      {action && <div>{action}</div>}
    </div>
  )
}

export { EmptyState }
