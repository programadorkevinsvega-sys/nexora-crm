export function getInitials(firstName?: string | null, lastName?: string | null, fallback = "?"): string {
  const first = firstName?.charAt(0) ?? ""
  const last = lastName?.charAt(0) ?? ""
  return (first + last).toUpperCase() || fallback
}

export function nameDisplay(firstName?: string | null, lastName?: string | null): string {
  return [firstName, lastName].filter(Boolean).join(" ") || "Unknown"
}
