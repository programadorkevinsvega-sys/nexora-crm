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
        "flex flex-col items-center justify-center py-16 px-6 text-center rounded-[12px] shadow-[rgb(35,37,42)_0px_0px_0px_1px_inset]",
        className,
      )}
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center text-[#383b3f]">
        {icon || <Inbox className="h-6 w-6" />}
      </div>
      <h3 className="text-[15px] font-[510] text-[#d0d6e0] mb-1.5">
        {title}
      </h3>
      {description && (
        <p className="text-[13px] text-[#62666d] max-w-sm mb-6">{description}</p>
      )}
      {action && <div>{action}</div>}
    </div>
  )
}

export { EmptyState }
