"use client"

import { useRef } from "react"
import { Search, X } from "lucide-react"
import { cn } from "@/src/shared/utils/cn"

export interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  shortcut?: string
}

function SearchInput({
  value,
  onChange,
  placeholder = "Filtrar por texto...",
  className,
  shortcut,
}: SearchInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div className={cn("relative group", className)}>
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-400 transition-colors" />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-9 w-full rounded-lg bg-[#121622] pl-9 pr-12 text-xs text-slate-100 placeholder:text-slate-400 border border-white/[0.08] focus:border-blue-500/50 focus:bg-[#151b2a] focus:ring-1 focus:ring-blue-500/30 outline-none transition-all shadow-inner"
      />
      {value ? (
        <button
          onClick={() => {
            onChange("")
            inputRef.current?.focus()
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors"
          aria-label="Limpiar búsqueda"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      ) : shortcut ? (
        <kbd className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-white/[0.05] rounded border border-white/[0.08]">
          {shortcut}
        </kbd>
      ) : null}
    </div>
  )
}

export { SearchInput }
