"use client"

import React, { useState } from "react"
import { GitFork, X, Check, Building, ShieldAlert } from "lucide-react"
import { Button } from "@/src/presentation/crm/components/ui/Button"
import { useUpdateContact } from "@/src/application/crm/di/hooks"
import type { Contact } from "@/src/infrastructure/crm/repositories/contacts/api-contact.repository"
import { SENIORITY_CONFIG, COMMON_DEPARTMENTS, type OrgNode, type SeniorityLevel } from "./org-chart-types"

interface ReassignManagerModalProps {
  node: OrgNode | null
  allContacts: Contact[]
  onClose: () => void
  onSuccess: () => void
}

export function ReassignManagerModal({
  node,
  allContacts,
  onClose,
  onSuccess,
}: ReassignManagerModalProps) {
  const { mutate: updateContact, isPending } = useUpdateContact()

  const [selectedManagerId, setSelectedManagerId] = useState<string>(node?.reportsToId || "")
  const [selectedDepartment, setSelectedDepartment] = useState<string>(node?.department || "")
  const [selectedSeniority, setSelectedSeniority] = useState<SeniorityLevel>(node?.seniorityLevel || "SPECIALIST")

  if (!node) return null

  const { contact } = node
  const potentialManagers = allContacts.filter((c) => c.id !== contact.id)

  const handleSave = () => {
    const existingMeta = contact.metadata || {}
    const updatedMeta = {
      ...existingMeta,
      reportsToId: selectedManagerId.trim().length > 0 ? selectedManagerId : null,
      department: selectedDepartment.trim().length > 0 ? selectedDepartment : undefined,
      seniorityLevel: selectedSeniority,
    }

    updateContact(
      {
        id: contact.id,
        data: {
          metadata: updatedMeta,
        },
      },
      {
        onSuccess: () => {
          onSuccess()
          onClose()
        },
      },
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <GitFork className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-zinc-100">Reasignar Jerarquía</h3>
              <p className="text-xs text-zinc-400">
                {contact.firstName} {contact.lastName || ""} ({contact.jobTitle || "Sin cargo"})
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 text-sm">
          {/* Supervisor directo */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-300">
              Reporta directamente a (Supervisor / Manager)
            </label>
            <select
              value={selectedManagerId}
              onChange={(e) => setSelectedManagerId(e.target.value)}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2.5 text-zinc-100 text-sm focus:border-cyan-500 focus:outline-none"
            >
              <option value="">👑 Puesto Máximo / CEO (Sin supervisor)</option>
              {potentialManagers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.firstName} {m.lastName || ""} — {m.jobTitle || "Sin cargo"}
                </option>
              ))}
            </select>
          </div>

          {/* Nivel Jerárquico */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-300">
              Rango / Nivel Jerárquico
            </label>
            <select
              value={selectedSeniority}
              onChange={(e) => setSelectedSeniority(e.target.value as SeniorityLevel)}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2.5 text-zinc-100 text-sm focus:border-cyan-500 focus:outline-none"
            >
              {Object.entries(SENIORITY_CONFIG).map(([key, cfg]) => (
                <option key={key} value={key}>
                  {cfg.label}
                </option>
              ))}
            </select>
          </div>

          {/* Departamento */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-300">
              Departamento / Área Funcional
            </label>
            <input
              type="text"
              list="common-depts"
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              placeholder="Ej. Tecnología & Ingeniería"
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2.5 text-zinc-100 text-sm focus:border-cyan-500 focus:outline-none"
            />
            <datalist id="common-depts">
              {COMMON_DEPARTMENTS.map((d) => (
                <option key={d} value={d} />
              ))}
            </datalist>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800/80">
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isPending} className="gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white">
            <Check className="h-4 w-4" />
            {isPending ? "Guardando..." : "Guardar Jerarquía"}
          </Button>
        </div>
      </div>
    </div>
  )
}
