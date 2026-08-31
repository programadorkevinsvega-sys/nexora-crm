"use client"

import React, { useState, useMemo } from "react"
import {
  ZoomIn, ZoomOut, RotateCcw, Search, Plus, Filter,
  Layers, Users, Building2, GitFork, UserPlus
} from "lucide-react"
import { Button } from "@/src/presentation/crm/components/ui/Button"
import { Skeleton } from "@/src/presentation/crm/components/ui/Skeleton"
import { useContactsList } from "@/src/application/crm/di/hooks"
import type { Contact } from "@/src/infrastructure/crm/repositories/contacts/api-contact.repository"
import { buildOrgChartTree } from "./org-chart-utils"
import { OrgChartNodeCard } from "./org-chart-node-card"
import { ReassignManagerModal } from "./org-chart-reassign-modal"
import { OrgChartCreateContactModal } from "./org-chart-create-contact-modal"
import type { OrgNode } from "./org-chart-types"

interface CompanyOrgChartProps {
  companyId: string
  companyName: string
}

export function CompanyOrgChart({ companyId, companyName }: CompanyOrgChartProps) {
  const { data: contactsResult, isLoading, refetch } = useContactsList({ companyId, limit: 100 })
  const contacts: Contact[] = (contactsResult as any)?.items || (contactsResult as any)?.data || (Array.isArray(contactsResult) ? contactsResult : [])

  const [zoom, setZoom] = useState<number>(1)
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [selectedDepartment, setSelectedDepartment] = useState<string>("ALL")
  const [reassigningNode, setReassigningNode] = useState<OrgNode | null>(null)
  const [createSubordinateFor, setCreateSubordinateFor] = useState<OrgNode | null>(null)
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false)

  // 1. Build Full Tree
  const fullTree = useMemo(() => buildOrgChartTree(contacts), [contacts])

  // 2. Department List
  const departments = useMemo(() => {
    const set = new Set<string>()
    contacts.forEach((c) => {
      if (c.metadata?.department) set.add(c.metadata.department)
    })
    return Array.from(set)
  }, [contacts])

  // 3. Filtered Tree for rendering
  const displayedTree = useMemo(() => {
    if (selectedDepartment === "ALL") return fullTree
    return fullTree.filter((node) => node.department === selectedDepartment || node.directReports.some((c) => c.department === selectedDepartment))
  }, [fullTree, selectedDepartment])

  if (isLoading) return <Skeleton className="h-96 w-full rounded-2xl" />

  if (contacts.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-12 text-center space-y-4">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center">
          <GitFork className="h-7 w-7" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-zinc-100">Sin contactos en el organigrama</h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            Esta empresa aún no tiene contactos registrados para generar la jerarquía organizacional.
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="gap-2 bg-cyan-600 hover:bg-cyan-500 text-white">
          <UserPlus className="h-4 w-4" />
          Añadir Primer Contacto (CEO)
        </Button>
        {showCreateModal && (
          <OrgChartCreateContactModal
            companyId={companyId}
            allContacts={contacts}
            onClose={() => setShowCreateModal(false)}
            onSuccess={() => refetch()}
          />
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Top Toolbar: Search, Dept Filter, Zoom & Add Contact */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl border border-zinc-800 bg-zinc-900/60 backdrop-blur-md">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar ejecutivo o cargo..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-zinc-800 bg-zinc-950 text-xs text-zinc-100 focus:border-cyan-500 focus:outline-none"
            />
          </div>
          {departments.length > 0 && (
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-200 focus:border-cyan-500 focus:outline-none"
            >
              <option value="ALL">🏢 Todos los Departamentos</option>
              {departments.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-zinc-950 border border-zinc-800 rounded-xl p-0.5 text-zinc-400">
            <button
              onClick={() => setZoom((z) => Math.max(0.6, z - 0.1))}
              className="p-1.5 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition"
              title="Alejar Zoom"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <span className="text-[11px] font-mono px-2 text-zinc-300 select-none">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.min(1.4, z + 0.1))}
              className="p-1.5 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition"
              title="Acercar Zoom"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            <button
              onClick={() => setZoom(1)}
              className="p-1.5 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition border-l border-zinc-800"
              title="Restablecer Zoom"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>

          <Button
            onClick={() => {
              setCreateSubordinateFor(null)
              setShowCreateModal(true)
            }}
            className="gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs h-8"
          >
            <UserPlus className="h-3.5 w-3.5" />
            Añadir Contacto
          </Button>
        </div>
      </div>

      {/* Main Interactive Tree Canvas */}
      <div className="w-full overflow-auto rounded-2xl border border-zinc-800 bg-zinc-950/80 p-8 min-h-[500px] flex justify-center items-start relative shadow-inner">
        <div
          className="transition-transform duration-150 origin-top flex flex-col items-center gap-12"
          style={{ transform: `scale(${zoom})` }}
        >
          {displayedTree.map((rootNode) => (
            <OrgChartNodeCard
              key={rootNode.contact.id}
              node={rootNode}
              onReassign={(node) => setReassigningNode(node)}
              onAddSubordinate={(node) => {
                setCreateSubordinateFor(node)
                setShowCreateModal(true)
              }}
              isHighlighted={Boolean(
                searchQuery.trim() &&
                (`${rootNode.contact.firstName} ${rootNode.contact.lastName || ""} ${rootNode.contact.jobTitle || ""}`
                  .toLowerCase()
                  .includes(searchQuery.toLowerCase()))
              )}
            />
          ))}
        </div>
      </div>

      {/* Reassign Hierarchy Modal */}
      {reassigningNode && (
        <ReassignManagerModal
          node={reassigningNode}
          allContacts={contacts}
          onClose={() => setReassigningNode(null)}
          onSuccess={() => refetch()}
        />
      )}

      {/* Create Contact Modal */}
      {showCreateModal && (
        <OrgChartCreateContactModal
          companyId={companyId}
          parentManagerNode={createSubordinateFor}
          allContacts={contacts}
          onClose={() => {
            setShowCreateModal(false)
            setCreateSubordinateFor(null)
          }}
          onSuccess={() => refetch()}
        />
      )}
    </div>
  )
}
export default CompanyOrgChart
