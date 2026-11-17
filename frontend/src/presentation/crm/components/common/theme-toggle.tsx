"use client"

import { Sun, Moon } from "lucide-react"
import { useTheme } from "@/src/application/crm/context/theme-context"

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className={`flex h-7 w-7 items-center justify-center rounded-[6px] text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors cursor-pointer select-none ${className || ""}`}
      title={theme === "dark" ? "Cambiar a Modo Claro" : "Cambiar a Modo Oscuro"}
      aria-label="Cambiar tema"
    >
      {theme === "dark" ? (
        <Sun size={14} className="text-amber-400" />
      ) : (
        <Moon size={14} className="text-indigo-500" />
      )}
    </button>
  )
}
