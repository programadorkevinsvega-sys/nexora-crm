"use client"

import React, { useState } from "react"
import { Play, Sparkles, CheckCircle2, Bot, AlertCircle } from "lucide-react"
import { Modal } from "@/src/presentation/crm/components/ui/Modal"
import { Button } from "@/src/presentation/crm/components/ui/Button"
import type { SocialPlatform, SocialPostType } from "@crm/contracts"

interface SocialSimulateModalProps {
  open: boolean
  onClose: () => void
  onSimulate: (dto: {
    platform: SocialPlatform
    postType: SocialPostType
    postTitle: string
    authorName: string
    message: string
  }) => Promise<any>
}

export function SocialSimulateModal({ open, onClose, onSimulate }: SocialSimulateModalProps) {
  const [platform, setPlatform] = useState<SocialPlatform>("INSTAGRAM")
  const [postType, setPostType] = useState<SocialPostType>("REEL")
  const [postTitle, setPostTitle] = useState("Reel: Automatización de Ventas con Nexora CRM 🚀")
  const [authorName, setAuthorName] = useState("Camila Vega")
  const [message, setMessage] = useState("¿Cuál es el precio de los planes?")
  const [simulating, setSimulating] = useState(false)
  const [result, setResult] = useState<any>(null)

  if (!open) return null

  const handleSimulate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSimulating(true)
    setResult(null)
    try {
      const res = await onSimulate({ platform, postType, postTitle, authorName, message })
      setResult(res)
    } finally {
      setSimulating(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="▶️ Simular Comentario en Publicación o Anuncio">
      <form onSubmit={handleSimulate} className="space-y-4 text-xs">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-medium text-foreground mb-1">Red Social</label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value as any)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs font-medium"
            >
              <option value="INSTAGRAM">Instagram (Reels / Posts / Ads)</option>
              <option value="FACEBOOK">Facebook (Página / Lead Ads)</option>
              <option value="TIKTOK">TikTok (Videos / Spark Ads)</option>
            </select>
          </div>
          <div>
            <label className="block font-medium text-foreground mb-1">Tipo de Publicación</label>
            <select
              value={postType}
              onChange={(e) => setPostType(e.target.value as any)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs"
            >
              <option value="REEL">Reel / Video Corto</option>
              <option value="AD_CREATIVE">Anuncio Patrocinado (Ads)</option>
              <option value="PAGE_POST">Publicación de Muro / Feed</option>
              <option value="TIKTOK_VIDEO">Video de TikTok</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block font-medium text-foreground mb-1">Título de la Publicación o Anuncio</label>
          <input
            type="text"
            required
            value={postTitle}
            onChange={(e) => setPostTitle(e.target.value)}
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-medium text-foreground mb-1">Nombre del Usuario</label>
            <input
              type="text"
              required
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs"
            />
          </div>
          <div>
            <label className="block font-medium text-foreground mb-1">Mensaje del Comentario</label>
            <input
              type="text"
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g. ¿Precio por favor? o Me interesa"
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs"
            />
          </div>
        </div>

        {result && (
          <div className="p-3.5 rounded-xl bg-primary/10 border border-primary/20 space-y-2 animate-in fade-in">
            <div className="flex items-center gap-2 font-semibold text-primary">
              <CheckCircle2 className="h-4 w-4" />
              {result.autoReplied ? "¡Regla Activada y Respondida por Bot!" : "Comentario Recibido (Sin autorespuesta)"}
            </div>
            {result.comment?.replyMessage && (
              <div className="p-2 rounded-lg bg-background border text-xs text-foreground space-y-1">
                <span className="text-[10px] uppercase font-bold text-muted-foreground">Respuesta Generada:</span>
                <p>&ldquo;{result.comment.replyMessage}&rdquo;</p>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2 border-t">
          <Button variant="ghost" type="button" onClick={onClose}>Cerrar</Button>
          <Button type="submit" disabled={simulating} className="gap-1.5">
            <Play className="h-3.5 w-3.5 fill-current" />
            {simulating ? "Simulando..." : "Ejecutar Prueba"}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
