import type { Contact } from "@/src/infrastructure/crm/repositories/contacts/api-contact.repository"

export type SeniorityLevel = "C_LEVEL" | "VP" | "DIRECTOR" | "MANAGER" | "LEAD" | "SPECIALIST" | "INDIVIDUAL_CONTRIBUTOR"

export interface OrgNode {
  contact: Contact
  seniorityLevel: SeniorityLevel
  department: string
  reportsToId: string | null
  directReports: OrgNode[]
  totalSubordinatesCount: number
  depth: number
}

export interface HierarchyChangeInput {
  contactId: string
  newReportsToId: string | null
  department?: string
  seniorityLevel?: SeniorityLevel
}

export const SENIORITY_CONFIG: Record<SeniorityLevel, { label: string; badgeColor: string; rank: number }> = {
  C_LEVEL: { label: "C-Suite / Junta Directiva", badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/30", rank: 1 },
  VP: { label: "Vicepresidencia (VP)", badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/30", rank: 2 },
  DIRECTOR: { label: "Dirección de Área", badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/30", rank: 3 },
  MANAGER: { label: "Gerencia / Manager", badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30", rank: 4 },
  LEAD: { label: "Líder Técnico / Lead", badgeColor: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30", rank: 5 },
  SPECIALIST: { label: "Especialista / Senior", badgeColor: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30", rank: 6 },
  INDIVIDUAL_CONTRIBUTOR: { label: "Colaborador / Operativo", badgeColor: "bg-zinc-500/10 text-zinc-400 border-zinc-500/30", rank: 7 },
}

export const COMMON_DEPARTMENTS = [
  "Dirección General & Estrategia",
  "Tecnología & Ingeniería",
  "Ventas & Expansión Comercial",
  "Operaciones & Logística",
  "Finanzas & Contabilidad",
  "Marketing & Crecimiento",
  "Recursos Humanos & Talento",
  "Soporte & Éxito del Cliente",
  "Legal & Cumplimiento",
]
