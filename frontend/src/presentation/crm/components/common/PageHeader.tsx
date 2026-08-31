import { type ReactNode } from "react"
import { cn } from "@/src/shared/utils/cn"

export interface BreadcrumbItem {
  label: string
  href?: string
}

export interface PageHeaderProps {
  title: string
  description?: string
  actions?: ReactNode
  breadcrumb?: BreadcrumbItem[]
  className?: string
}

function PageHeader({
  title,
  description,
  actions,
  breadcrumb,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {breadcrumb && breadcrumb.length > 0 && (
        <nav className="flex items-center gap-2 text-caption text-ash">
          {breadcrumb.map((item, index) => (
            <span key={index} className="flex items-center gap-2">
              {index > 0 && <span>/</span>}
              {item.href ? (
                <a
                  href={item.href}
                  className="hover:text-paper transition-colors"
                >
                  {item.label}
                </a>
              ) : (
                <span className="text-paper">{item.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-heading font-sans font-bold text-paper">
            {title}
          </h1>
          {description && (
            <p className="text-body text-ash">{description}</p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2 shrink-0">{actions}</div>
        )}
      </div>
    </div>
  )
}

export { PageHeader }
