"use client"

import React, { useState } from "react"
import { Sparkles, X, Check, Send } from "lucide-react"
import { MetaIcon } from "./meta-icon"
import { Button } from "@/src/presentation/crm/components/ui/Button"
import { useSimulateMetaLead } from "@/src/application/crm/di/hooks"

interface MetaSimulateModalProps {
  onClose: () => void
}

export function MetaSimulateModal({ onClose }: MetaSimulateModalProps) {
  const { mutate: simulateLead, isPending } = useSimulateMetaLead()

  const [fullName, setFullName] = useState("Laura Martínez")
  const [email, setEmail] = useState("laura.martinez@enterprise.com")
  const [phone, setPhone] = useState("+57 300 987 6543")
  const [companyName, setCompanyName] = useState("Global Logistics LATAM")
  const [jobTitle, setJobTitle] = useState("Directora Comercial")
  const [campaignName, setCampaignName] = useState("Campaña Facebook Lead Ads — Conversión B2B Q3")
  const [adName, setAdName] = useState("Anuncio Video Demo Interactivo 30s")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    simulateLead(
      {
        fullName,
        email,
        phone,
        companyName,
        jobTitle,
        campaignName,
        adName,
        formName: "Formulario Registro Demo Facebook",
      },
      {
        onSuccess: () => {
          onClose()
        },
      },
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <MetaIcon className="h-5 w-5" />
            </div>

            <div>
              <h3 className="text-base font-semibold text-zinc-100">Simular Entrada de Lead de Meta</h3>
              <p className="text-xs text-zinc-400">Prueba la creación inmediata de Contacto y Deal en el CRM</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-zinc-300 mb-1">Nombre Completo *</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-zinc-100 focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-medium text-zinc-300 mb-1">Correo Corporativo *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-zinc-100 focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-zinc-300 mb-1">Teléfono / WhatsApp</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-zinc-100 focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-medium text-zinc-300 mb-1">Empresa</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-zinc-100 focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-3 pt-2 border-t border-zinc-800/80">
            <div>
              <label className="block font-medium text-zinc-300 mb-1">Campaña de Facebook Ads</label>
              <input
                type="text"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-zinc-100 focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-medium text-zinc-300 mb-1">Nombre del Anuncio (Ad Name)</label>
              <input
                type="text"
                value={adName}
                onChange={(e) => setAdName(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-zinc-100 focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
            <Button variant="outline" type="button" onClick={onClose} disabled={isPending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending} className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <Send className="h-3.5 w-3.5" />
              {isPending ? "Procesando Lead..." : "Disparar Lead de Prueba"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
