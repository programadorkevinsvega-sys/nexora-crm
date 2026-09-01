import { type ReactNode } from "react"
import { cn } from "@/src/shared/utils/cn"
import { Card } from "@/src/presentation/crm/components/ui/Card"

export interface EntityCardProps {
  title?: string
  subtitle?: string
  actions?: ReactNode
  children?: ReactNode
  className?: string
  icon?: ReactNode
}

function EntityCard({
  title,
  subtitle,
  actions,
  children,
  className,
  icon,
}: EntityCardProps) {
  return (
    <Card className={cn("space-y-4 border border-white/[0.08] bg-[#0f1420]/70 backdrop-blur-md p-5", className)}>
      {(title || actions || icon) && (
        <div className="flex items-start justify-between gap-4 pb-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            {icon && <div className="p-1.5 rounded-lg bg-white/[0.05] text-blue-400 shrink-0">{icon}</div>}
            <div className="space-y-0.5">
              {title && (
                <h3 className="text-sm font-semibold text-slate-100 tracking-tight">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-xs text-slate-400">{subtitle}</p>
              )}
            </div>
          </div>
          {actions && (
            <div className="flex items-center gap-2 shrink-0">{actions}</div>
          )}
        </div>
      )}
      {children && <div className="text-xs leading-relaxed text-slate-200">{children}</div>}
    </Card>
  )
}

export { EntityCard }
