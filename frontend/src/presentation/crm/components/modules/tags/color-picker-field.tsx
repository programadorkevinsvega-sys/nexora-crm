"use client"

import { Input } from "@/src/presentation/crm/components/ui/Input"

const PRESET_COLORS = [
  "#3b82f6", "#10b981", "#f59e0b", "#ef4444",
  "#8b5cf6", "#ec4899", "#14b8a6", "#f97316",
  "#6b7280", "#1e293b",
]

export interface ColorPickerFieldProps {
  value: string
  onChange: (color: string) => void
}

export function ColorPickerField({ value, onChange }: ColorPickerFieldProps) {
  return (
    <div className="space-y-1">
      <label className="text-caption text-ash font-medium block">Color</label>
      <div className="flex items-center gap-1">
        {PRESET_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => onChange(color)}
            className={`h-6 w-6 rounded-full border-2 transition-all ${
              value === color ? "border-white scale-110" : "border-transparent"
            }`}
            style={{ backgroundColor: color }}
            aria-label={`Select color ${color}`}
          />
        ))}
        <Input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="!h-6 !w-6 !p-0 !rounded-full !border-0 cursor-pointer"
        />
      </div>
    </div>
  )
}
