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
      <Search className="pointer-events-none absolute left-2.5 top-1/2 h-[13px] w-[13px] -translate-y-1/2 text-[#62666d]" />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-8 w-full rounded-[6px] bg-[rgba(255,255,255,0.02)] border border-[#23252a] pl-8 pr-10 text-[13px] text-[#d0d6e0] placeholder:text-[#62666d] focus:border-[#d0d6e0] focus:outline-none transition-colors"
      />
      {value ? (
        <button
          onClick={() => {
            onChange("")
            inputRef.current?.focus()
          }}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 flex h-4 w-4 items-center justify-center rounded text-[#62666d] hover:text-[#d0d6e0] transition-colors"
          aria-label="Limpiar búsqueda"
        >
          <X className="h-3 w-3" />
        </button>
      ) : shortcut ? (
        <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center px-1 text-[11px] font-mono text-[#62666d] bg-[rgba(255,255,255,0.05)] rounded-[3px]">
          {shortcut}
        </kbd>
      ) : null}
    </div>
  )
}

export { SearchInput }
