"use client"

import React, { useState } from "react"
import { HardDrive, Eye, EyeOff, CheckCircle2, ExternalLink } from "lucide-react"
import { Button } from "@/src/presentation/crm/components/ui/Button"
import { ApiIntegrationsRepository } from "@/src/infrastructure/crm/repositories/integrations/api-integrations.repository"

type Provider = "CLOUDFLARE_R2" | "AWS_S3"

interface Props {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function StorageConfigModal({ open, onClose, onSuccess }: Props) {
  const [provider, setProvider] = useState<Provider>("CLOUDFLARE_R2")
  const [endpoint, setEndpoint] = useState("")
  const [accessKeyId, setAccessKeyId] = useState("")
  const [secretAccessKey, setSecretAccessKey] = useState("")
  const [bucketName, setBucketName] = useState("nexora-kb-files")
  const [publicUrl, setPublicUrl] = useState("")
  const [region, setRegion] = useState("auto")
  const [showSecret, setShowSecret] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!open) return null

  const isR2 = provider === "CLOUDFLARE_R2"

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!accessKeyId.trim() || !secretAccessKey.trim() || !bucketName.trim()) {
      setError("Access Key ID, Secret Access Key y Bucket Name son obligatorios.")
      return
    }
    if (isR2 && !endpoint.trim()) {
      setError("El Endpoint de R2 es obligatorio (https://<account_id>.r2.cloudflarestorage.com).")
      return
    }
    setSaving(true)
    setError(null)
    try {
      await ApiIntegrationsRepository.saveConfig({
        provider: provider === "CLOUDFLARE_R2" ? "CLOUDFLARE_R2" : "AWS_S3",
        credentials: {
          endpoint: isR2 ? endpoint.trim() : undefined,
          accessKeyId: accessKeyId.trim(),
          secretAccessKey: secretAccessKey.trim(),
          bucketName: bucketName.trim(),
          publicUrl: publicUrl.trim() || undefined,
          region: isR2 ? "auto" : region.trim(),
        },
        isEnabled: true,
      })
      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err?.message || "Error al guardar credenciales de almacenamiento.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg shadow-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 p-5 border-b border-zinc-800">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
            <HardDrive className="h-5 w-5 text-cyan-400" />
          </div>
          <div>
            <h2 className="font-bold text-zinc-100 text-sm">Almacenamiento en la Nube</h2>
            <p className="text-xs text-zinc-400">Archivos de la Base de Conocimiento (PDFs, Imágenes, Docs)</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="p-5 space-y-4">
          {/* Provider selector */}
          <div>
            <label className="text-xs font-medium text-zinc-400 block mb-1.5">Proveedor de Almacenamiento</label>
            <div className="grid grid-cols-2 gap-2">
              {(["CLOUDFLARE_R2", "AWS_S3"] as Provider[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => { setProvider(p); setRegion(p === "AWS_S3" ? "us-east-1" : "auto") }}
                  className={`px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                    provider === p
                      ? "border-cyan-500 bg-cyan-500/10 text-cyan-300"
                      : "border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-600"
                  }`}
                >
                  {p === "CLOUDFLARE_R2" ? "☁️ Cloudflare R2" : "🟠 Amazon S3"}
                </button>
              ))}
            </div>
          </div>

          {/* R2 Endpoint (only for R2) */}
          {isR2 && (
            <div>
              <label className="text-xs font-medium text-zinc-400 block mb-1">
                Endpoint R2 <span className="text-red-400">*</span>
              </label>
              <input
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
                placeholder="https://<ACCOUNT_ID>.r2.cloudflarestorage.com"
                className="w-full px-3 py-2 text-xs bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
              />
              <p className="text-[10px] text-zinc-500 mt-1">
                Encuéntralo en{" "}
                <a href="https://dash.cloudflare.com" target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline inline-flex items-center gap-0.5">
                  dash.cloudflare.com <ExternalLink className="h-2.5 w-2.5" />
                </a>
                {" "}→ R2 → Overview → Account ID
              </p>
            </div>
          )}

          {/* AWS Region (only for S3) */}
          {!isR2 && (
            <div>
              <label className="text-xs font-medium text-zinc-400 block mb-1">Región AWS</label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:border-cyan-500"
              >
                {["us-east-1", "us-east-2", "us-west-1", "us-west-2", "eu-west-1", "eu-central-1", "sa-east-1"].map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          )}

          {/* Access Key ID */}
          <div>
            <label className="text-xs font-medium text-zinc-400 block mb-1">
              Access Key ID <span className="text-red-400">*</span>
            </label>
            <input
              value={accessKeyId}
              onChange={(e) => setAccessKeyId(e.target.value)}
              placeholder={isR2 ? "R2 Access Key ID" : "AKIAIOSFODNN7EXAMPLE"}
              className="w-full px-3 py-2 text-xs bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Secret Access Key */}
          <div>
            <label className="text-xs font-medium text-zinc-400 block mb-1">
              Secret Access Key <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <input
                type={showSecret ? "text" : "password"}
                value={secretAccessKey}
                onChange={(e) => setSecretAccessKey(e.target.value)}
                placeholder="••••••••••••••••••••••••••••••••••••••••"
                className="w-full px-3 py-2 pr-9 text-xs bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
              />
              <button type="button" onClick={() => setShowSecret(!showSecret)} className="absolute right-2.5 top-2 text-zinc-500 hover:text-zinc-300">
                {showSecret ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>

          {/* Bucket Name */}
          <div>
            <label className="text-xs font-medium text-zinc-400 block mb-1">
              Nombre del Bucket <span className="text-red-400">*</span>
            </label>
            <input
              value={bucketName}
              onChange={(e) => setBucketName(e.target.value)}
              placeholder="nexora-kb-files"
              className="w-full px-3 py-2 text-xs bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Public URL */}
          <div>
            <label className="text-xs font-medium text-zinc-400 block mb-1">
              URL Pública CDN <span className="text-zinc-500 text-[10px]">(opcional)</span>
            </label>
            <input
              value={publicUrl}
              onChange={(e) => setPublicUrl(e.target.value)}
              placeholder={isR2 ? "https://pub-xxxx.r2.dev" : "https://tu-bucket.s3.amazonaws.com"}
              className="w-full px-3 py-2 text-xs bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
            />
            <p className="text-[10px] text-zinc-500 mt-1">Si se configura, los archivos de la KB tendrán URL pública accesible desde el portal de clientes.</p>
          </div>

          {error && (
            <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              ⚠️ {error}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
            <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={saving}>Cancelar</Button>
            <Button type="submit" size="sm" disabled={saving}>
              {saving ? "Guardando..." : <><CheckCircle2 className="h-3.5 w-3.5 mr-1.5" /> Guardar Configuración</>}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
