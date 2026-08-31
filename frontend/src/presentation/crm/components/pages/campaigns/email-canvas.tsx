"use client"

import React from "react"
import { EmailBlock } from "./email-template-types"
import { EmailBlockRenderer } from "./email-block-renderer"
import { Layers } from "lucide-react"

interface Props {
  blocks: EmailBlock[]
  selectedId: string | null
  onSelect: (id: string) => void
  onReorder: (draggedId: string, targetId: string) => void
  onAddBlock: (type: any, index?: number) => void
}

export function EmailCanvas({ blocks, selectedId, onSelect, onReorder, onAddBlock }: Props) {
  const [draggedId, setDraggedId] = React.useState<string | null>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDropCanvas = (e: React.DragEvent) => {
    e.preventDefault()
    const data = e.dataTransfer.getData("application/json")
    if (data) {
      try {
        const parsed = JSON.parse(data)
        if (parsed.action === "add" && parsed.type) {
          onAddBlock(parsed.type)
        }
      } catch (_) {}
    }
  }

  const handleBlockDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id)
    e.dataTransfer.setData("text/plain", id)
  }

  const handleBlockDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault()
    e.stopPropagation()
    if (draggedId && draggedId !== targetId) {
      onReorder(draggedId, targetId)
    }
    setDraggedId(null)
  }

  return (
    <div
      className="flex-1 bg-zinc-900 overflow-y-auto p-6 flex flex-col items-center justify-start min-h-[600px]"
      onDragOver={handleDragOver}
      onDrop={handleDropCanvas}
    >
      <div className="w-full max-w-[620px] bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden min-h-[500px]">
        {/* Email Header Preview Bar */}
        <div className="bg-zinc-900 border-b border-zinc-800 px-4 py-2 flex items-center justify-between text-[11px] text-zinc-400">
          <span className="flex items-center gap-1.5 font-mono">
            <Layers size={13} className="text-cyan-400" /> Vista Previa del Correo (600px)
          </span>
          <span className="text-[10px] text-zinc-500">HTML Responsive</span>
        </div>

        {/* Blocks Zone */}
        <div className="p-4 space-y-3 min-h-[420px]">
          {blocks.length === 0 ? (
            <div className="h-64 border-2 border-dashed border-zinc-800 rounded-lg flex flex-col items-center justify-center text-zinc-500 text-xs p-6 text-center">
              <Layers size={28} className="text-zinc-600 mb-2" />
              <p className="font-semibold text-zinc-400">El lienzo de correo está vacío</p>
              <p className="text-[11px] text-zinc-600 mt-1">
                Arrastra bloques desde el panel izquierdo o haz clic en ellos para agregarlos.
              </p>
            </div>
          ) : (
            blocks.map((block) => (
              <EmailBlockRenderer
                key={block.id}
                block={block}
                isSelected={block.id === selectedId}
                onClick={onSelect}
                onDragStart={handleBlockDragStart}
                onDragOver={handleDragOver}
                onDrop={handleBlockDrop}
              />
            ))
          )}
        </div>

        {/* Email Footer Preview Bar */}
        <div className="bg-zinc-900/60 border-t border-zinc-800/80 px-4 py-3 text-center text-[10px] text-zinc-500 space-y-1">
          <p>Has recibido este correo porque estás registrado en Nexora CRM.</p>
          <div className="flex justify-center gap-3 text-zinc-400">
            <span className="underline cursor-pointer">Darse de baja</span>
            <span>•</span>
            <span className="underline cursor-pointer">Preferencias de email</span>
          </div>
        </div>
      </div>
    </div>
  )
}
