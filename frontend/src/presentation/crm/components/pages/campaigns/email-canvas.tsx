"use client"

import React from "react"
import { EmailBlock } from "./email-template-types"
import { EmailBlockRenderer } from "./email-block-renderer"
import { Layers, Plus } from "lucide-react"

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
    e.dataTransfer.dropEffect = "copy"
  }

  const handleDropCanvas = (e: React.DragEvent) => {
    e.preventDefault()
    const textData = e.dataTransfer.getData("text/plain")
    const jsonData = e.dataTransfer.getData("application/json")
    
    if (jsonData) {
      try {
        const parsed = JSON.parse(jsonData)
        if (parsed.action === "add" && parsed.type) {
          onAddBlock(parsed.type)
          return
        }
      } catch (_) {}
    }
    if (textData && ["text", "image", "button", "spacer", "divider"].includes(textData)) {
      onAddBlock(textData)
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
      className="flex-1 bg-muted/20 overflow-y-auto p-6 flex flex-col items-center justify-start h-full"
      onDragOver={handleDragOver}
      onDrop={handleDropCanvas}
    >
      <div className="w-full max-w-[620px] bg-card border border-border rounded-xl shadow-lg overflow-hidden flex flex-col shrink-0 my-auto sm:my-4">
        {/* Email Header Preview Bar */}
        <div className="bg-muted/50 border-b border-border px-4 py-2 flex items-center justify-between text-[11px] text-muted-foreground select-none">
          <span className="flex items-center gap-1.5 font-mono font-medium">
            <Layers size={13} className="text-primary" /> Vista Previa del Correo (600px)
          </span>
          <span className="text-[10px] text-muted-foreground/70">HTML Responsive</span>
        </div>

        {/* Blocks Zone */}
        <div className="p-4 space-y-3 min-h-[360px]">
          {blocks.length === 0 ? (
            <div className="h-64 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center text-muted-foreground text-xs p-6 text-center">
              <Layers size={28} className="text-muted-foreground/50 mb-2" />
              <p className="font-semibold text-foreground">El lienzo de correo está vacío</p>
              <p className="text-[11px] text-muted-foreground mt-1">
                Haz clic en cualquier bloque del panel izquierdo para agregarlo a este correo.
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
        <div className="bg-muted/30 border-t border-border px-4 py-3 text-center text-[10px] text-muted-foreground space-y-1 select-none">
          <p>Has recibido este correo porque estás registrado en Nexora CRM.</p>
          <div className="flex justify-center gap-3 text-muted-foreground">
            <span className="underline cursor-pointer">Darse de baja</span>
            <span>•</span>
            <span className="underline cursor-pointer">Preferencias de email</span>
          </div>
        </div>
      </div>
    </div>
  )
}
