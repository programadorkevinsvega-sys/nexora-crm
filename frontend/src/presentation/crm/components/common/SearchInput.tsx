"use client"

import { useRef } from "react"
import { Search, X } from "lucide-react"
import { cn } from "@/src/shared/utils/cn"

export interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

function SearchInput({
  value,
  onChange,
  placeholder = "Search...",
  className,
}: SearchInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div className={cn("relative", className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ash" />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-[var(--radius-inputs)] bg-graphite pl-10 pr-10 text-body text-paper placeholder:text-ash rekki-inset focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal-blue"
      />
      {value && (
        <button
          onClick={() => {
            onChange("")
            inputRef.current?.focus()
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full text-ash hover:text-paper transition-colors"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}

export { SearchInput }
