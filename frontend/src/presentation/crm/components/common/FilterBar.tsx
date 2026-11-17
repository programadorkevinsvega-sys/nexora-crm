"use client"

import { cn } from "@/src/shared/utils/cn"
import { Select } from "@/src/presentation/crm/components/ui/Select"

export interface FilterDef {
  key: string
  label: string
  options: { value: string; label: string }[]
  placeholder?: string
}

export interface FilterBarProps {
  filters: FilterDef[]
  values: Record<string, string>
  onChange: (key: string, value: string) => void
  className?: string
}

function FilterBar({
  filters,
  values,
  onChange,
  className,
}: FilterBarProps) {
  return (
    <div className={cn("flex flex-wrap gap-3", className)}>
      {filters.map((filter) => (
        <div key={filter.key} className="flex items-center gap-2">
          <label className="text-caption text-ash font-medium whitespace-nowrap">
            {filter.label}
          </label>
          <Select
            value={values[filter.key] || ""}
            onChange={(e) => onChange(filter.key, e.target.value)}
            className="w-40"
          >
            <option value="">
              {filter.placeholder || `All ${filter.label}`}
            </option>
            {filter.options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
        </div>
      ))}
    </div>
  )
}

export { FilterBar }
