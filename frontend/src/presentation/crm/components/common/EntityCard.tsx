import { type ReactNode } from "react"
import { cn } from "@/src/shared/utils/cn"
import { Card } from "@/src/presentation/crm/components/ui/Card"

export interface EntityCardProps {
  title?: string
  subtitle?: string
  actions?: ReactNode
  children?: ReactNode
  className?: string
}

function EntityCard({
  title,
  subtitle,
  actions,
  children,
  className,
}: EntityCardProps) {
  return (
    <Card className={cn("space-y-4", className)}>
      {(title || actions) && (
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            {title && (
              <h3 className="text-heading-sm font-sans font-semibold text-paper">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-body text-ash">{subtitle}</p>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-2 shrink-0">{actions}</div>
          )}
        </div>
      )}
      {children && <div>{children}</div>}
    </Card>
  )
}

export { EntityCard }
