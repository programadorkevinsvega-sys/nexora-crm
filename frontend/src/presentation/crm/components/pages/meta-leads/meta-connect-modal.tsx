"use client"

import React, { useState } from "react"
import { Facebook, Key, Building2, Check, Loader2, Sparkles, HelpCircle, ExternalLink } from "lucide-react"
import { Modal } from "@/src/presentation/crm/components/ui/Modal"
import { Button } from "@/src/presentation/crm/components/ui/Button"
import { useFetchMetaPages, useConnectMetaAccount } from "@/src/application/crm/di/hooks"
import { ApiMetaLeadsRepository } from "@/src/infrastructure/crm/repositories/meta-leads/api-meta-leads.repository"

interface MetaConnectModalProps {
  onClose: () => void
  onSuccess: () => void
}

export function MetaConnectModal({ onClose, onSuccess }: MetaConnectModalProps) {
  const [activeTab, setActiveTab] = useState<"token" | "oauth">("token")
  const [accessToken, setAccessToken] = useState("")
  const [metaAppId, setMetaAppId] = useState("")
  const [pages, setPages] = useState<Array<{ id: string; name: string; access_token?: string }>>([])
  const [adAccounts, setAdAccounts] = useState<Array<{ id: string; name: string }>>([])
  const [selectedPageId, setSelectedPageId] = useState("")
  const [selectedAdAccountId, setSelectedAdAccountId] = useState("")

  const { mutate: fetchPages, isPending: isFetching } = useFetchMetaPages()
  const { mutate: connectAccount, isPending: isConnecting } = useConnectMetaAccount()

  const handleOAuth = async () => {
    try {
      const { url } = await ApiMetaLeadsRepository.getOAuthUrl()
      window.location.href = url
    } catch {
      window.open("https://www.facebook.com/v20.0/dialog/oauth", "_blank")
    }
  }

  const handleFetch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!accessToken.trim()) return

    fetchPages(accessToken.trim(), {
      onSuccess: (data) => {
        setPages(data.pages || [])
        setAdAccounts(data.adAccounts || [])
        if (data.pages?.length > 0) setSelectedPageId(data.pages[0].id)
        if (data.adAccounts?.length > 0) setSelectedAdAccountId(data.adAccounts[0].id)
      },
    })
  }

  const handleConnectSelected = () => {
    const selectedPage = pages.find((p) => p.id === selectedPageId)
    const selectedAd = adAccounts.find((a) => a.id === selectedAdAccountId)
    if (!selectedPage) return

    connectAccount(
      {
        pageId: selectedPage.id,
        pageName: selectedPage.name,
        pageAccessToken: selectedPage.access_token,
        adAccountId: selectedAd?.id,
        adAccountName: selectedAd?.name,
        userAccessToken: accessToken,
        metaAppId: metaAppId || undefined,
      },
      {
        onSuccess: () => {
          onSuccess()
          onClose()
        },
      }
    )
  }

  return (
    <Modal open={true} onClose={onClose} title="Conectar con Meta Business & Facebook Lead Ads">
      <div className="space-y-4 text-xs">
        {/* Tabs */}
        <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab("token")}
            className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
              activeTab === "token"
                ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Key className="h-3.5 w-3.5" />
            <span>Token de Acceso / System User (Recomendado)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("oauth")}
            className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
              activeTab === "oauth"
                ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Facebook className="h-3.5 w-3.5" />
            <span>OAuth 2.0 Directo</span>
          </button>
        </div>

        {activeTab === "oauth" ? (
          <div className="space-y-4 p-4 rounded-xl border border-zinc-800 bg-zinc-950/60 text-center">
            <Facebook className="h-10 w-10 text-blue-500 mx-auto" />
            <div className="space-y-1">
              <h4 className="font-semibold text-zinc-100">Iniciar Sesión con tu Cuenta de Facebook</h4>
              <p className="text-zinc-400 max-w-sm mx-auto text-[11px]">
                Te redirigiremos a Meta para que autorices los permisos de lectura de tus Páginas y Formularios de Lead Ads.
              </p>
            </div>
            <Button onClick={handleOAuth} className="bg-blue-600 hover:bg-blue-500 text-white gap-2 mx-auto">
              <Facebook className="h-4 w-4" />
              Abrir Login de Meta Facebook
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <form onSubmit={handleFetch} className="space-y-3 p-3.5 rounded-xl border border-zinc-800 bg-zinc-950/60">
              <div className="flex items-center justify-between">
                <label className="font-medium text-zinc-200 block">User Access Token / System User Token *</label>
                <a
                  href="https://developers.facebook.com/tools/explorer/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1"
                >
                  <ExternalLink className="h-3 w-3" /> Graph Explorer
                </a>
              </div>
              <textarea
                rows={2}
                required
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                placeholder="Pega aquí tu token EAAB... generado en Meta for Developers o Business Manager"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-zinc-100 font-mono text-[11px] focus:outline-none focus:border-cyan-500"
              />

              <div className="flex items-center justify-between">
                <div className="text-[11px] text-zinc-400 flex items-center gap-1">
                  <HelpCircle className="h-3 w-3" /> Permisos: <span className="text-zinc-200">pages_read_engagement, leads_retrieval</span>
                </div>
                <Button type="submit" disabled={isFetching || !accessToken.trim()} size="sm" className="bg-cyan-600 hover:bg-cyan-500 text-white">
                  {isFetching ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "🔍 Consultar Mis Páginas"}
                </Button>
              </div>
            </form>

            {pages.length > 0 && (
              <div className="space-y-3 p-3.5 rounded-xl border border-cyan-500/30 bg-cyan-950/20 animate-in fade-in">
                <div className="font-semibold text-cyan-200">Páginas de Facebook Encontradas:</div>
                <div>
                  <label className="block text-zinc-300 mb-1">Selecciona la Página a Conectar:</label>
                  <select
                    value={selectedPageId}
                    onChange={(e) => setSelectedPageId(e.target.value)}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100 focus:outline-none focus:border-cyan-500"
                  >
                    {pages.map((p) => (
                      <option key={p.id} value={p.id}>{p.name} (ID: {p.id})</option>
                    ))}
                  </select>
                </div>

                {adAccounts.length > 0 && (
                  <div>
                    <label className="block text-zinc-300 mb-1">Cuenta Publicitaria (Ad Account):</label>
                    <select
                      value={selectedAdAccountId}
                      onChange={(e) => setSelectedAdAccountId(e.target.value)}
                      className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100 focus:outline-none focus:border-cyan-500"
                    >
                      {adAccounts.map((a) => (
                        <option key={a.id} value={a.id}>{a.name} ({a.id})</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="pt-2 flex justify-end gap-2">
                  <Button variant="ghost" onClick={onClose}>Cancelar</Button>
                  <Button
                    onClick={handleConnectSelected}
                    disabled={isConnecting || !selectedPageId}
                    className="bg-cyan-600 hover:bg-cyan-500 text-white gap-1.5"
                  >
                    {isConnecting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                    Guardar y Activar Conexión
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  )
}
