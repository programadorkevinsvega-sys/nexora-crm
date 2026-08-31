"use client"

import { cn } from "@/src/shared/utils/cn"

export interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
  className?: string
}

function ColorPicker({ value, onChange, className }: ColorPickerProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-[var(--radius-inputs)] rekki-inset">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 h-12 w-12 cursor-pointer border-none bg-transparent p-0"
          style={{ margin: "-4px" }}
        />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex h-10 w-full rounded-[var(--radius-inputs)] bg-graphite px-3 py-2 text-body text-paper font-mono placeholder:text-ash rekki-inset focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal-blue"
        placeholder="#hex"
        maxLength={7}
      />
    </div>
  )
}

export { ColorPicker }
