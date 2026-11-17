"use client"

import React, { useState } from "react"
import { TrendingUp, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"
import { Modal } from "@/src/presentation/crm/components/ui/Modal"
import { Button } from "@/src/presentation/crm/components/ui/Button"
import { ApiIntegrationsRepository } from "@/src/infrastructure/crm/repositories/integrations/api-integrations.repository"

interface AccountingConfigModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function AccountingConfigModal({ isOpen, onClose, onSuccess }: AccountingConfigModalProps) {
  const [provider, setProvider] = useState("QUICKBOOKS")
  const [apiKey, setApiKey] = useState("")
  const [apiUrl, setApiUrl] = useState("")
  const [companyId, setCompanyId] = useState("")
  const [sandbox, setSandbox] = useState(true)
  const [testing, setTesting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleTest = async () => {
    setTesting(true)
    setTestResult(null)
    try {
      const res = await ApiIntegrationsRepository.testIntegration(
        "ACCOUNTING" as any,
        companyId || "test-company",
        "Test de sincronización contable"
      )
      setTestResult(res)
    } catch (err: any) {
      setTestResult({ success: false, message: err?.message || "Error al conectar con el sistema contable" })
    } finally {
      setTesting(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await ApiIntegrationsRepository.saveConfig({
        provider: "ACCOUNTING" as any,
        isEnabled: true,
        credentials: {
          provider,
          apiKey: apiKey.trim(),
          apiUrl: apiUrl.trim() || undefined,
          companyId: companyId.trim() || undefined,
          sandbox,
        },
      })
      onSuccess()
      onClose()
    } catch (err: any) {
      alert(`Error al guardar: ${err?.message}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="🧾 Software Contable & Facturación Electrónica">
      <form onSubmit={handleSave} className="space-y-4 text-xs">
        <p className="text-muted-foreground text-[11px]">
          Emite facturas y sincroniza cobros automáticamente en tu sistema contable cuando una oportunidad (Deal) pase a estado GANADO o se acepte una cotización.
        </p>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-medium mb-1">Proveedor Contable *</label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="w-full px-3 py-2 border rounded-md bg-background text-xs font-semibold"
            >
              <option value="QUICKBOOKS">QuickBooks Online (Intuit)</option>
              <option value="SIIGO">Siigo Cloud (LATAM)</option>
              <option value="ALEGRA">Alegra Contabilidad</option>
              <option value="FACTURAMA">Facturama (CFDI 4.0)</option>
              <option value="GENERIC_ERP">ERP Personalizado (REST API)</option>
            </select>
          </div>
          <div>
            <label className="block font-medium mb-1">ID Empresa / Tenant Contable</label>
            <input
              type="text"
              placeholder="e.g. 900123456"
              value={companyId}
              onChange={(e) => setCompanyId(e.target.value)}
              className="w-full px-3 py-2 border rounded-md bg-background text-xs font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block font-medium mb-1">API Key / Bearer Access Token *</label>
          <input
            type="password"
            required
            placeholder="Clave API o Access Token del software contable..."
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full px-3 py-2 border rounded-md bg-background text-xs font-mono"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">URL Endpoint API (Opcional si usa cloud estándar)</label>
          <input
            type="url"
            placeholder="https://api.siigo.com/v1/invoices o https://quickbooks.api.intuit.com/v3"
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
            className="w-full px-3 py-2 border rounded-md bg-background text-xs font-mono"
          />
        </div>

        <div className="flex items-center gap-2 p-2.5 bg-muted/40 rounded-lg border">
          <input
            type="checkbox"
            id="sandbox_mode"
            checked={sandbox}
            onChange={(e) => setSandbox(e.target.checked)}
            className="rounded"
          />
          <label htmlFor="sandbox_mode" className="text-xs cursor-pointer select-none">
            Modo Sandbox / Pruebas (No genera facturas fiscales reales)
          </label>
        </div>

        {testResult && (
          <div className={`p-3 rounded-lg border flex items-start gap-2 ${testResult.success ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-destructive/10 border-destructive/30 text-destructive"}`}>
            {testResult.success ? <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" /> : <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />}
            <div className="text-xs">{testResult.message}</div>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t">
          <Button type="button" variant="outline" size="sm" onClick={handleTest} disabled={testing || !apiKey.trim()}>
            {testing ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <TrendingUp className="h-3.5 w-3.5 mr-1" />}
            Probar Conexión
          </Button>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" size="sm" disabled={saving}>
              {saving ? "Guardando..." : "Guardar Configuración"}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  )
}

export default AccountingConfigModal
