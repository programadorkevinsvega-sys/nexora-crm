"use client"

import React from "react"
import { EmailBlock } from "./email-template-types"
import { Trash2, Copy, AlignLeft, AlignCenter, AlignRight } from "lucide-react"

interface Props {
  block: EmailBlock | null
  onUpdate: (updated: EmailBlock) => void
  onDelete: (id: string) => void
  onDuplicate: (block: EmailBlock) => void
}

export function EmailBlockInspector({ block, onUpdate, onDelete, onDuplicate }: Props) {
  if (!block) {
    return (
      <div className="w-72 border-l border-border bg-card p-4 text-xs text-muted-foreground h-full overflow-y-auto shrink-0 select-none">
        <h4 className="font-semibold text-foreground uppercase tracking-wider text-[11px] mb-3">Inspector de Bloque</h4>
        <p className="text-muted-foreground">Selecciona un bloque en el lienzo para personalizar su contenido, colores y enlaces.</p>
      </div>
    )
  }

  const handleContentChange = (content: string) => {
    onUpdate({ ...block, content })
  }

  const handleStyleChange = (key: string, value: any) => {
    onUpdate({
      ...block,
      style: { ...(block.style || {}), [key]: value },
    })
  }

  return (
    <div className="w-72 border-l border-border bg-card p-4 overflow-y-auto text-xs space-y-4 shadow-sm h-full shrink-0">
      <div className="flex items-center justify-between border-b border-border pb-2">
        <span className="font-semibold text-foreground uppercase tracking-wider text-[11px]">
          Bloque: {block.type}
        </span>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => onDuplicate(block)}
            className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="Duplicar"
          >
            <Copy size={13} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(block.id)}
            className="p-1 rounded text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 transition-colors"
            title="Eliminar"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Text / Banner / Button Content */}
      {(block.type === "text" || block.type === "button") && (
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-foreground">Texto / Mensaje</label>
          {block.type === "text" ? (
            <textarea
              rows={4}
              value={block.content || ""}
              onChange={(e) => handleContentChange(e.target.value)}
              className="w-full p-2 bg-input border border-border rounded-lg text-foreground text-xs focus:border-primary outline-none"
            />
          ) : (
            <input
              type="text"
              value={block.content || ""}
              onChange={(e) => handleContentChange(e.target.value)}
              className="w-full p-2 bg-input border border-border rounded-lg text-foreground text-xs focus:border-primary outline-none"
            />
          )}
        </div>
      )}

      {/* Button & Image URL */}
      {(block.type === "button" || block.type === "image") && (
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-foreground">
            {block.type === "button" ? "Enlace de Destino (URL)" : "URL de la Imagen"}
          </label>
          <input
            type="url"
            value={block.url || ""}
            onChange={(e) => onUpdate({ ...block, url: e.target.value })}
            placeholder="https://..."
            className="w-full p-2 bg-input border border-border rounded-lg text-foreground text-xs focus:border-primary outline-none font-mono"
          />
        </div>
      )}

      {/* Image Alt Text */}
      {block.type === "image" && (
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-foreground">Texto Alternativo (Alt Text)</label>
          <input
            type="text"
            value={block.altText || ""}
            onChange={(e) => onUpdate({ ...block, altText: e.target.value })}
            className="w-full p-2 bg-input border border-border rounded-lg text-foreground text-xs focus:border-primary outline-none"
          />
        </div>
      )}

      {/* Spacer height */}
      {block.type === "spacer" && (
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-foreground">Altura del Espaciador (px)</label>
          <input
            type="number"
            value={parseInt(String(block.style?.height || "24"), 10)}
            onChange={(e) => handleStyleChange("height", `${e.target.value}px`)}
            className="w-full p-2 bg-input border border-border rounded-lg text-foreground text-xs focus:border-primary outline-none font-mono"
          />
        </div>
      )}

      {/* Colors & Alignment */}
      <div className="space-y-3 pt-2 border-t border-border">
        <label className="text-[11px] font-semibold text-foreground block">Estilos y Apariencia</label>

        {/* Alignment */}
        <div className="flex items-center gap-1 bg-muted p-1 rounded-lg border border-border">
          <button
            type="button"
            onClick={() => handleStyleChange("textAlign", "left")}
            className={`flex-1 py-1 flex justify-center rounded ${block.style?.textAlign === "left" ? "bg-card text-foreground font-semibold shadow-2xs" : "text-muted-foreground hover:text-foreground"}`}
          >
            <AlignLeft size={13} />
          </button>
          <button
            type="button"
            onClick={() => handleStyleChange("textAlign", "center")}
            className={`flex-1 py-1 flex justify-center rounded ${block.style?.textAlign === "center" ? "bg-card text-foreground font-semibold shadow-2xs" : "text-muted-foreground hover:text-foreground"}`}
          >
            <AlignCenter size={13} />
          </button>
          <button
            type="button"
            onClick={() => handleStyleChange("textAlign", "right")}
            className={`flex-1 py-1 flex justify-center rounded ${block.style?.textAlign === "right" ? "bg-card text-foreground font-semibold shadow-2xs" : "text-muted-foreground hover:text-foreground"}`}
          >
            <AlignRight size={13} />
          </button>
        </div>

        {/* Colors */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-muted-foreground block mb-1">Color de Texto</label>
            <input
              type="color"
              value={String(block.style?.color || "#ffffff")}
              onChange={(e) => handleStyleChange("color", e.target.value)}
              className="w-full h-8 bg-input border border-border rounded-lg cursor-pointer p-0.5"
            />
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground block mb-1">Color de Fondo</label>
            <input
              type="color"
              value={String(block.style?.backgroundColor || (block.type === "button" ? "#06b6d4" : "#18181b"))}
              onChange={(e) => handleStyleChange("backgroundColor", e.target.value)}
              className="w-full h-8 bg-input border border-border rounded-lg cursor-pointer p-0.5"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
