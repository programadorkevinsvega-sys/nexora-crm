import type { Contact } from "@/src/infrastructure/crm/repositories/contacts/api-contact.repository"
import type { OrgNode, SeniorityLevel } from "./org-chart-types"
import { SENIORITY_CONFIG } from "./org-chart-types"

export function inferSeniority(jobTitle?: string | null, explicitLevel?: string | null): SeniorityLevel {
  if (explicitLevel && explicitLevel in SENIORITY_CONFIG) {
    return explicitLevel as SeniorityLevel
  }

  const title = (jobTitle || "").toLowerCase().trim()
  if (/\b(ceo|cto|cfo|coo|cmo|cro|cio|cpo|presidente|fundador|owner|socio fundador|director general)\b/i.test(title)) {
    return "C_LEVEL"
  }
  if (/\b(vp|vicepresidente|vice president|head of|socio)\b/i.test(title)) {
    return "VP"
  }
  if (/\b(director|directora)\b/i.test(title)) {
    return "DIRECTOR"
  }
  if (/\b(gerente|manager|jefe|chief)\b/i.test(title)) {
    return "MANAGER"
  }
  if (/\b(lead|líder|team lead|senior architect|principal)\b/i.test(title)) {
    return "LEAD"
  }
  if (/\b(specialist|especialista|senior|analyst|analista|ingeniero|desarrollador|consultant)\b/i.test(title)) {
    return "SPECIALIST"
  }
  return "INDIVIDUAL_CONTRIBUTOR"
}

export function inferDepartment(jobTitle?: string | null, explicitDept?: string | null): string {
  if (explicitDept && explicitDept.trim().length > 0) return explicitDept

  const title = (jobTitle || "").toLowerCase()
  if (/\b(tecnología|technology|it|dev|developer|engineer|software|arquitecto|cto)\b/i.test(title)) {
    return "Tecnología & Ingeniería"
  }
  if (/\b(ventas|sales|comercial|commercial|cuenta|account|expansion|cro)\b/i.test(title)) {
    return "Ventas & Expansión Comercial"
  }
  if (/\b(finanzas|finance|cfo|contabilidad|compras|procurement|tesoreria)\b/i.test(title)) {
    return "Finanzas & Compras"
  }
  if (/\b(marketing|crecimiento|growth|cmo|seo|publicidad|comunicacion)\b/i.test(title)) {
    return "Marketing & Crecimiento"
  }
  if (/\b(operaciones|operations|coo|logistica|calidad)\b/i.test(title)) {
    return "Operaciones & Logística"
  }
  if (/\b(soporte|support|customer success|servicio|atencion)\b/i.test(title)) {
    return "Soporte & Éxito del Cliente"
  }
  if (/\b(legal|juridico|compliance|abogado)\b/i.test(title)) {
    return "Legal & Cumplimiento"
  }
  return "Dirección General"
}

export function buildOrgChartTree(contacts: Contact[]): OrgNode[] {
  if (!contacts || contacts.length === 0) return []

  const nodeMap = new Map<string, OrgNode>()

  // 1. Initialize all nodes
  contacts.forEach((contact) => {
    const meta = contact.metadata || {}
    const seniorityLevel = inferSeniority(contact.jobTitle, meta.seniorityLevel)
    const department = inferDepartment(contact.jobTitle, meta.department)
    const reportsToId = meta.reportsToId || null

    nodeMap.set(contact.id, {
      contact,
      seniorityLevel,
      department,
      reportsToId,
      directReports: [],
      totalSubordinatesCount: 0,
      depth: 0,
    })
  })

  // 2. Link children to parents
  const rootNodes: OrgNode[] = []
  const visited = new Set<string>()

  nodeMap.forEach((node) => {
    if (node.reportsToId && nodeMap.has(node.reportsToId) && node.reportsToId !== node.contact.id) {
      const parent = nodeMap.get(node.reportsToId)!
      parent.directReports.push(node)
    } else {
      rootNodes.push(node)
    }
  })

  // 3. Fallback: If no explicit parent was set for some and no single root exists, sort roots by seniority rank
  rootNodes.sort((a, b) => SENIORITY_CONFIG[a.seniorityLevel].rank - SENIORITY_CONFIG[b.seniorityLevel].rank)

  // 4. Calculate depths and total subordinates recursively
  function calculateMetrics(node: OrgNode, currentDepth: number) {
    if (visited.has(node.contact.id)) return // prevent circular references
    visited.add(node.contact.id)

    node.depth = currentDepth
    node.directReports.sort((a, b) => SENIORITY_CONFIG[a.seniorityLevel].rank - SENIORITY_CONFIG[b.seniorityLevel].rank)

    let total = node.directReports.length
    node.directReports.forEach((child) => {
      calculateMetrics(child, currentDepth + 1)
      total += child.totalSubordinatesCount
    })
    node.totalSubordinatesCount = total
  }

  rootNodes.forEach((root) => calculateMetrics(root, 0))

  return rootNodes
}
