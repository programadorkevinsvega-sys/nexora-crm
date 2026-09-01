"use client"

import { Sun, Moon } from "lucide-react"
import { useTheme } from "@/src/application/crm/context/theme-context"

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className={`flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-amber-300 hover:bg-white/[0.06] border border-white/[0.08] transition-all cursor-pointer select-none ${className || ""}`}
      title={theme === "dark" ? "Cambiar a Modo Claro" : "Cambiar a Modo Oscuro"}
      aria-label="Cambiar tema"
    >
      {theme === "dark" ? (
        <Sun className="w-4 h-4 text-amber-400 transition-transform rotate-0 scale-100" />
      ) : (
        <Moon className="w-4 h-4 text-blue-500 transition-transform rotate-0 scale-100" />
      )}
    </button>
  )
}
