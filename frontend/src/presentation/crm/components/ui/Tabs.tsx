"use client"

import { cn } from "@/src/shared/utils/cn"

export interface Tab {
  id: string
  label: string
  count?: number
}

export interface TabsProps {
  tabs: Tab[]
  activeTab: string
  onChange: (tabId: string) => void
  className?: string
}

function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
  return (
    <div className={cn("flex gap-1 border-b border-steel", className)}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              "relative px-4 py-3 text-body font-sans font-medium transition-colors",
              isActive
                ? "text-paper"
                : "text-ash hover:text-paper",
            )}
          >
            <span className="flex items-center gap-2">
              {tab.label}
              {tab.count !== undefined && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-iron px-1.5 text-caption text-ash">
                  {tab.count}
                </span>
              )}
            </span>
            {isActive && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-signal-blue rounded-full" />
            )}
          </button>
        )
      })}
    </div>
  )
}

export { Tabs }
