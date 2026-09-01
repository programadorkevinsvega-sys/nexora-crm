"use client"

import { useEffect, type ReactNode } from "react"
import { X } from "lucide-react"

export interface QuickDrawerProps {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  badge?: ReactNode
  actions?: ReactNode
  children: ReactNode
  width?: "md" | "lg" | "xl"
}

export function QuickDrawer({
  open,
  onClose,
  title,
  subtitle,
  badge,
  actions,
  children,
  width = "lg",
}: QuickDrawerProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) onClose()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [open, onClose])

  if (!open) return null

  const widthClass = {
    md: "max-w-md",
    lg: "max-w-xl",
    xl: "max-w-3xl",
  }[width]

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Backdrop click */}
      <div className="fixed inset-0 cursor-default" onClick={onClose} />

      {/* Slide-over Container */}
      <div
        className={`relative w-full ${widthClass} h-full bg-[#0e121a] border-l border-white/10 shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-250 ease-out`}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-white/[0.08] bg-white/[0.02]">
          <div className="space-y-1.5 pr-4">
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg font-semibold text-slate-100 tracking-tight">{title}</h2>
              {badge}
            </div>
            {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {actions}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/[0.06] transition-colors"
              title="Cerrar (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">{children}</div>
      </div>
    </div>
  )
}
