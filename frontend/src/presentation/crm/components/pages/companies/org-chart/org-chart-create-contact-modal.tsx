"use client"

import React, { useState } from "react"
import { UserPlus, X, Check } from "lucide-react"
import { Button } from "@/src/presentation/crm/components/ui/Button"
import { useCreateContact } from "@/src/application/crm/di/hooks"
import { useAuth } from "@/src/presentation/hooks/use-auth"
import type { Contact } from "@/src/infrastructure/crm/repositories/contacts/api-contact.repository"
import { SENIORITY_CONFIG, COMMON_DEPARTMENTS, type SeniorityLevel, type OrgNode } from "./org-chart-types"

interface OrgChartCreateContactModalProps {
  companyId: string
  parentManagerNode?: OrgNode | null
  allContacts: Contact[]
  onClose: () => void
  onSuccess: () => void
}

export function OrgChartCreateContactModal({
  companyId,
  parentManagerNode,
  allContacts,
  onClose,
  onSuccess,
}: OrgChartCreateContactModalProps) {
  const { tenantId } = useAuth()
  const { mutate: createContact, isPending } = useCreateContact()

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [jobTitle, setJobTitle] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [reportsToId, setReportsToId] = useState(parentManagerNode?.contact.id || "")
  const [department, setDepartment] = useState(parentManagerNode?.department || "Tecnología & Ingeniería")
  const [seniorityLevel, setSeniorityLevel] = useState<SeniorityLevel>("SPECIALIST")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!firstName.trim()) return

    createContact(
      {
        tenantId,
        companyId,
        firstName: firstName.trim(),
        lastName: lastName.trim() || undefined,
        jobTitle: jobTitle.trim() || undefined,
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        leadStatus: "QUALIFIED",
        metadata: {
          reportsToId: reportsToId.trim().length > 0 ? reportsToId : null,
          department: department.trim().length > 0 ? department : undefined,
          seniorityLevel,
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
      <div className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-zinc-100">Añadir Contacto al Organigrama</h3>
              <p className="text-xs text-zinc-400">Registra un nuevo miembro en la estructura de la empresa</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Nombre *</label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Ej. Ana"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-zinc-100 text-sm focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Apellido</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Ej. Gómez"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-zinc-100 text-sm focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Cargo / Puesto</label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="Ej. Directora de Finanzas"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-zinc-100 text-sm focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Nivel Jerárquico</label>
              <select
                value={seniorityLevel}
                onChange={(e) => setSeniorityLevel(e.target.value as SeniorityLevel)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-zinc-100 text-sm focus:border-cyan-500 focus:outline-none"
              >
                {Object.entries(SENIORITY_CONFIG).map(([key, cfg]) => (
                  <option key={key} value={key}>{cfg.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ana.gomez@empresa.com"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-zinc-100 text-sm focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Teléfono</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+57-300-123-4567"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-zinc-100 text-sm focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Reporta a (Manager)</label>
              <select
                value={reportsToId}
                onChange={(e) => setReportsToId(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-zinc-100 text-sm focus:border-cyan-500 focus:outline-none"
              >
                <option value="">👑 CEO / Sin Supervisor</option>
                {allContacts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.firstName} {c.lastName || ""} ({c.jobTitle || "Sin cargo"})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Departamento</label>
              <input
                type="text"
                list="modal-depts"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="Ej. Finanzas"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-zinc-100 text-sm focus:border-cyan-500 focus:outline-none"
              />
              <datalist id="modal-depts">
                {COMMON_DEPARTMENTS.map((d) => (
                  <option key={d} value={d} />
                ))}
              </datalist>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800/80">
            <Button variant="outline" type="button" onClick={onClose} disabled={isPending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending} className="gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white">
              <Check className="h-4 w-4" />
              {isPending ? "Guardando..." : "Crear e Integrar al Árbol"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
