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
        "flex flex-col items-center justify-center py-16 px-6 text-center rounded-2xl border border-white/[0.06] bg-gradient-to-b from-[#101522]/50 to-[#0c0f17]/50 backdrop-blur-sm",
        className,
      )}
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/5 border border-white/[0.08] text-blue-400 shadow-lg shadow-black/20">
        {icon || <Inbox className="h-6 w-6" />}
      </div>
      <h3 className="text-base font-semibold text-slate-100 mb-1.5 tracking-tight">
        {title}
      </h3>
      {description && (
        <p className="text-xs text-slate-400 max-w-sm mb-6 leading-relaxed">{description}</p>
      )}
      {action && <div>{action}</div>}
    </div>
  )
}

export { EmptyState }
