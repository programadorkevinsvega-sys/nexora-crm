"use client"

import React from "react"
import { BlockType } from "./email-template-types"
import { Type, Image as ImageIcon, MousePointerClick, MoveVertical, Minus, Plus } from "lucide-react"

interface Props {
  onAddBlock: (type: BlockType) => void
}

const BLOCK_TYPES: { type: BlockType; label: string; icon: any; description: string }[] = [
  { type: "text", label: "Texto / Párrafo", icon: Type, description: "Títulos, párrafos y texto enriquecido" },
  { type: "image", label: "Imagen / Banner", icon: ImageIcon, description: "Fotografías, logos y banners" },
  { type: "button", label: "Botón CTA", icon: MousePointerClick, description: "Llamado a la acción con enlace" },
  { type: "spacer", label: "Espaciador", icon: MoveVertical, description: "Espacio vertical configurable" },
  { type: "divider", label: "Línea Divisoria", icon: Minus, description: "Separador visual horizontal" },
]

export function EmailBlockPalette({ onAddBlock }: Props) {
  const handleDragStart = (e: React.DragEvent, type: BlockType) => {
    e.dataTransfer.setData("application/json", JSON.stringify({ type, action: "add" }))
    e.dataTransfer.setData("text/plain", type)
  }

  return (
    <div className="w-64 border-r border-border bg-card p-4 overflow-y-auto h-full flex flex-col shrink-0 select-none">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-foreground">Bloques Disponibles</h3>
        <p className="text-[11px] text-muted-foreground mt-0.5">Haz clic o arrastra para insertar</p>
      </div>

      <div className="space-y-2 flex-1">
        {BLOCK_TYPES.map((block) => {
          const Icon = block.icon
          return (
            <button
              key={block.type}
              type="button"
              draggable
              onDragStart={(e) => handleDragStart(e, block.type)}
              onClick={() => onAddBlock(block.type)}
              className="w-full text-left flex items-center justify-between p-3 border border-border rounded-xl cursor-pointer bg-background hover:bg-muted hover:border-primary/50 transition-all group shadow-2xs active:scale-[0.98]"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20 group-hover:scale-110 transition-transform">
                  <Icon size={15} />
                </div>
                <div className="overflow-hidden">
                  <span className="text-xs font-semibold text-foreground block truncate">{block.label}</span>
                  <span className="text-[10px] text-muted-foreground block truncate">{block.description}</span>
                </div>
              </div>
              <Plus size={14} className="text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
            </button>
          )
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-border text-[11px] text-muted-foreground text-center">
        💡 Consejo: Haz clic en cualquier bloque dentro del correo para editar su texto, colores o enlaces.
      </div>
    </div>
  )
}
