"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { EmailBlock, BlockType } from "./email-template-types"
import { EmailBlockPalette } from "./email-block-palette"
import { EmailCanvas } from "./email-canvas"
import { EmailBlockInspector } from "./email-block-inspector"
import { renderTemplateToHtml } from "./email-template-renderer"
import { ArrowLeft, Save, Send, Download, Sparkles, CheckCircle2 } from "lucide-react"

const DEFAULT_BLOCKS: EmailBlock[] = [
  {
    id: "b-1",
    type: "text",
    content: "¡Hola {{contact.firstName}}! 👋 Te presentamos nuestras últimas novedades.",
    style: { color: "#ffffff", fontSize: "16px", textAlign: "left", fontWeight: "bold" },
  },
  {
    id: "b-2",
    type: "image",
    url: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&auto=format&fit=crop&q=80",
    altText: "Banner Promocional",
    style: { textAlign: "center" },
  },
  {
    id: "b-3",
    type: "text",
    content: "Hemos lanzado nuevas herramientas de automatización comercial, telefonía VoIP integrada y reportes dinámicos.",
    style: { color: "#a1a1aa", fontSize: "14px", textAlign: "left" },
  },
  {
    id: "b-4",
    type: "button",
    content: "🚀 Explorar Nuevas Funcionalidades",
    url: "https://nexoracrm.com/demo",
    style: { textAlign: "center", backgroundColor: "#06b6d4", color: "#ffffff" },
  },
]

export function EmailTemplateEditorPage() {
  const router = useRouter()
  const [templateName, setTemplateName] = useState("Campaña de Lanzamiento Q3")
  const [subject, setSubject] = useState("🚀 Novedades y Actualizaciones en Nexora CRM")
  const [blocks, setBlocks] = useState<EmailBlock[]>(DEFAULT_BLOCKS)
  const [selectedId, setSelectedId] = useState<string | null>("b-1")
  const [savedSuccess, setSavedSuccess] = useState(false)

  const handleAddBlock = (type: BlockType) => {
    const newBlock: EmailBlock = {
      id: `b-${Date.now()}`,
      type,
      content: type === "text" ? "Escribe tu texto aquí..." : type === "button" ? "Haz Clic Aquí" : undefined,
      url: type === "button" ? "https://..." : type === "image" ? "https://..." : undefined,
      style: { color: "#e4e4e7", textAlign: "left" },
    }
    setBlocks((prev) => [...prev, newBlock])
    setSelectedId(newBlock.id)
  }

  const handleUpdateBlock = (updated: EmailBlock) => {
    setBlocks((prev) => prev.map((b) => (b.id === updated.id ? updated : b)))
  }

  const handleDeleteBlock = (id: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id))
    if (selectedId === id) setSelectedId(null)
  }

  const handleDuplicateBlock = (block: EmailBlock) => {
    const duplicated: EmailBlock = {
      ...block,
      id: `b-${Date.now()}`,
    }
    setBlocks((prev) => [...prev, duplicated])
    setSelectedId(duplicated.id)
  }

  const handleReorder = (draggedId: string, targetId: string) => {
    setBlocks((prev) => {
      const copy = [...prev]
      const dragIdx = copy.findIndex((b) => b.id === draggedId)
      const targetIdx = copy.findIndex((b) => b.id === targetId)
      if (dragIdx === -1 || targetIdx === -1) return prev
      const [removed] = copy.splice(dragIdx, 1)
      copy.splice(targetIdx, 0, removed)
      return copy
    })
  }

  const handleExportHtml = () => {
    const html = renderTemplateToHtml({ subject, body: { blocks } })
    const blob = new Blob([html], { type: "text/html" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${templateName.toLowerCase().replace(/\s+/g, "-")}.html`
    a.click()
  }

  const handleSave = () => {
    setSavedSuccess(true)
    setTimeout(() => setSavedSuccess(false), 2500)
  }

  const selectedBlock = blocks.find((b) => b.id === selectedId) || null

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] bg-zinc-950 text-zinc-100 -m-6">
      {/* Top Bar */}
      <div className="h-14 border-b border-zinc-800 bg-zinc-900/90 px-4 flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/campaigns")}
            className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              className="bg-transparent font-bold text-sm text-zinc-100 hover:bg-zinc-800/50 px-2 py-0.5 rounded focus:bg-zinc-950 border border-transparent focus:border-zinc-700 outline-none"
            />
            <div className="flex items-center gap-1.5 px-2 text-[11px] text-zinc-400">
              <span>Asunto:</span>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="bg-transparent text-cyan-300 hover:bg-zinc-800/50 px-1 rounded focus:bg-zinc-950 border border-transparent focus:border-zinc-700 outline-none w-72"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {savedSuccess && (
            <span className="flex items-center gap-1 text-emerald-400 text-xs font-medium mr-2">
              <CheckCircle2 size={14} /> Guardado
            </span>
          )}
          <button
            onClick={handleExportHtml}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-800 text-xs hover:bg-zinc-700 transition-colors"
          >
            <Download size={13} /> Exportar HTML
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs shadow-md transition-colors"
          >
            <Save size={13} /> Guardar Plantilla
          </button>
        </div>
      </div>

      {/* Main 3-Column Designer */}
      <div className="flex flex-1 overflow-hidden">
        <EmailBlockPalette />
        <EmailCanvas
          blocks={blocks}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onReorder={handleReorder}
          onAddBlock={handleAddBlock}
        />
        <EmailBlockInspector
          block={selectedBlock}
          onUpdate={handleUpdateBlock}
          onDelete={handleDeleteBlock}
          onDuplicate={handleDuplicateBlock}
        />
      </div>
    </div>
  )
}

export default EmailTemplateEditorPage
