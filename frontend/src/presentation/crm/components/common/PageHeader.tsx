import { type ReactNode } from "react"
import Link from "next/link"
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
  badge?: ReactNode
}

function PageHeader({
  title,
  description,
  actions,
  breadcrumb,
  className,
  badge,
}: PageHeaderProps) {
  return (
    <div className={cn("space-y-2 pb-2", className)}>
      {breadcrumb && breadcrumb.length > 0 && (
        <nav className="flex items-center gap-1 text-[12px] text-[#62666d]">
          {breadcrumb.map((item, index) => (
            <span key={index} className="flex items-center gap-1">
              {index > 0 && <span className="text-[#383b3f] select-none">/</span>}
              {item.href ? (
                <Link href={item.href} className="hover:text-[#d0d6e0] transition-colors">
                  {item.label}
                </Link>
              ) : (
                <span className="text-[#8a8f98]">{item.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2.5">
            <h1 className="text-[20px] font-[510] text-[#ffffff] tracking-[-0.24px] leading-[1.33]">
              {title}
            </h1>
            {badge}
          </div>
          {description && (
            <p className="text-[13px] text-[#8a8f98] font-[400]">{description}</p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2 shrink-0 flex-wrap">{actions}</div>
        )}
      </div>
    </div>
  )
}

export { PageHeader }
