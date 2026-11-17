"use client"

import React, { useState } from "react"
import { Code, Copy, Check, ExternalLink, X, Globe, Sparkles } from "lucide-react"
import { Button } from "@/src/presentation/crm/components/ui/Button"
import type { WebForm } from "@crm/contracts"

interface FormBuilderEmbedModalProps {
  form: WebForm
  onClose: () => void
}

export function FormBuilderEmbedModal({ form, onClose }: FormBuilderEmbedModalProps) {
  const [copiedType, setCopiedType] = useState<string | null>(null)

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"
  const publicUrl = `${baseUrl}/f/${form.slug}`
  const embedUrl = `${baseUrl}/embed/form/${form.id}`

  const iframeSnippet = `<iframe\n  src="${embedUrl}"\n  width="100%"\n  height="600"\n  frameborder="0"\n  style="border: none; border-radius: ${form.borderRadius || '12px'}; max-width: 600px; width: 100%;"\n  title="${form.title}"\n></iframe>`

  const scriptSnippet = `<div id="nexora-form-${form.slug}"></div>\n<script\n  src="${baseUrl}/embed/nexora-form.js"\n  data-form-id="${form.id}"\n  data-container="nexora-form-${form.slug}"\n  async\n></script>`

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopiedType(type)
    setTimeout(() => setCopiedType(null), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="w-full max-w-2xl rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Code className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-zinc-100">Código de Integración & Embebido</h3>
              <p className="text-xs text-zinc-400">Pega este formulario en WordPress, Shopify, Webflow o tu web</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Enlace Público Directo */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-300 flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5 text-cyan-400" />
              1. Enlace Directo (Landing Page Pública)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={publicUrl}
                className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2 text-xs font-mono text-cyan-300 focus:outline-none select-all"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopy(publicUrl, "link")}
                className="gap-1.5"
              >
                {copiedType === "link" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                {copiedType === "link" ? "Copiado" : "Copiar"}
              </Button>
              <a
                href={publicUrl}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-cyan-400 hover:border-cyan-500/30 transition"
                title="Abrir en pestaña nueva"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Iframe Embebible */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-medium text-zinc-300 flex items-center gap-1.5">
                <Code className="h-3.5 w-3.5 text-purple-400" />
                2. Código Iframe HTML (Recomendado para WordPress / Shopify / Wix)
              </label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopy(iframeSnippet, "iframe")}
                className="gap-1.5 text-xs h-7"
              >
                {copiedType === "iframe" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                {copiedType === "iframe" ? "Copiado" : "Copiar Código"}
              </Button>
            </div>
            <pre className="rounded-xl border border-zinc-800 bg-zinc-900/90 p-3 text-[11px] font-mono text-zinc-300 overflow-x-auto whitespace-pre">
              {iframeSnippet}
            </pre>
          </div>

          {/* Script Tag */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-medium text-zinc-300 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                3. Widget JavaScript Embebible
              </label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopy(scriptSnippet, "script")}
                className="gap-1.5 text-xs h-7"
              >
                {copiedType === "script" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                {copiedType === "script" ? "Copiado" : "Copiar Script"}
              </Button>
            </div>
            <pre className="rounded-xl border border-zinc-800 bg-zinc-900/90 p-3 text-[11px] font-mono text-zinc-300 overflow-x-auto whitespace-pre">
              {scriptSnippet}
            </pre>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-zinc-800 text-xs text-zinc-400">
          <span>Cada envío creará un Contacto y registrará una Oportunidad (Lead) en el CRM.</span>
          <Button onClick={onClose} variant="outline" size="sm">
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  )
}
