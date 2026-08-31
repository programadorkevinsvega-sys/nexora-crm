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
      <div className="w-72 border-l border-zinc-800 bg-zinc-950 p-4 text-xs text-zinc-400">
        <h4 className="font-bold text-zinc-200 uppercase tracking-wider text-[11px] mb-3">Inspector de Bloque</h4>
        <p className="text-zinc-500">Selecciona un bloque en el lienzo para personalizar su contenido, colores y estilos.</p>
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
    <div className="w-72 border-l border-zinc-800 bg-zinc-950 p-4 overflow-y-auto text-xs space-y-4 shadow-xl">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
        <span className="font-bold text-zinc-100 uppercase tracking-wider text-[11px]">
          Bloque: {block.type}
        </span>
        <div className="flex gap-1">
          <button
            onClick={() => onDuplicate(block)}
            className="p-1 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            title="Duplicar"
          >
            <Copy size={13} />
          </button>
          <button
            onClick={() => onDelete(block.id)}
            className="p-1 rounded text-rose-400 hover:text-rose-200 hover:bg-rose-950/40 transition-colors"
            title="Eliminar"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Text / Banner / Button Content */}
      {(block.type === "text" || block.type === "button") && (
        <div className="space-y-1">
          <label className="text-[11px] text-zinc-400">Texto / Mensaje</label>
          {block.type === "text" ? (
            <textarea
              rows={4}
              value={block.content || ""}
              onChange={(e) => handleContentChange(e.target.value)}
              className="w-full p-2 bg-zinc-900 border border-zinc-700 rounded text-zinc-200 text-xs focus:border-cyan-500 outline-none"
            />
          ) : (
            <input
              type="text"
              value={block.content || ""}
              onChange={(e) => handleContentChange(e.target.value)}
              className="w-full p-2 bg-zinc-900 border border-zinc-700 rounded text-zinc-200 text-xs focus:border-cyan-500 outline-none"
            />
          )}
        </div>
      )}

      {/* Button & Image URL */}
      {(block.type === "button" || block.type === "image") && (
        <div className="space-y-1">
          <label className="text-[11px] text-zinc-400">
            {block.type === "button" ? "Enlace de Destino (URL)" : "URL de la Imagen"}
          </label>
          <input
            type="url"
            value={block.url || ""}
            onChange={(e) => onUpdate({ ...block, url: e.target.value })}
            placeholder="https://..."
            className="w-full p-2 bg-zinc-900 border border-zinc-700 rounded text-zinc-200 text-xs focus:border-cyan-500 outline-none font-mono"
          />
        </div>
      )}

      {/* Image Alt Text */}
      {block.type === "image" && (
        <div className="space-y-1">
          <label className="text-[11px] text-zinc-400">Texto Alternativo (Alt Text)</label>
          <input
            type="text"
            value={block.altText || ""}
            onChange={(e) => onUpdate({ ...block, altText: e.target.value })}
            className="w-full p-2 bg-zinc-900 border border-zinc-700 rounded text-zinc-200 text-xs focus:border-cyan-500 outline-none"
          />
        </div>
      )}

      {/* Spacer height */}
      {block.type === "spacer" && (
        <div className="space-y-1">
          <label className="text-[11px] text-zinc-400">Altura del Espaciador (px)</label>
          <input
            type="number"
            value={parseInt(String(block.style?.height || "24"), 10)}
            onChange={(e) => handleStyleChange("height", `${e.target.value}px`)}
            className="w-full p-2 bg-zinc-900 border border-zinc-700 rounded text-zinc-200 text-xs focus:border-cyan-500 outline-none font-mono"
          />
        </div>
      )}

      {/* Colors & Alignment */}
      <div className="space-y-3 pt-2 border-t border-zinc-800">
        <label className="text-[11px] font-bold text-zinc-300 block">Estilos y Apariencia</label>

        {/* Alignment */}
        <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded border border-zinc-800">
          <button
            type="button"
            onClick={() => handleStyleChange("textAlign", "left")}
            className={`flex-1 py-1 flex justify-center rounded ${block.style?.textAlign === "left" ? "bg-cyan-500/20 text-cyan-400" : "text-zinc-400 hover:text-zinc-200"}`}
          >
            <AlignLeft size={13} />
          </button>
          <button
            type="button"
            onClick={() => handleStyleChange("textAlign", "center")}
            className={`flex-1 py-1 flex justify-center rounded ${block.style?.textAlign === "center" ? "bg-cyan-500/20 text-cyan-400" : "text-zinc-400 hover:text-zinc-200"}`}
          >
            <AlignCenter size={13} />
          </button>
          <button
            type="button"
            onClick={() => handleStyleChange("textAlign", "right")}
            className={`flex-1 py-1 flex justify-center rounded ${block.style?.textAlign === "right" ? "bg-cyan-500/20 text-cyan-400" : "text-zinc-400 hover:text-zinc-200"}`}
          >
            <AlignRight size={13} />
          </button>
        </div>

        {/* Colors */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-zinc-400 block mb-1">Color de Texto</label>
            <input
              type="color"
              value={String(block.style?.color || "#e4e4e7")}
              onChange={(e) => handleStyleChange("color", e.target.value)}
              className="w-full h-8 bg-zinc-900 border border-zinc-700 rounded cursor-pointer p-0.5"
            />
          </div>
          <div>
            <label className="text-[10px] text-zinc-400 block mb-1">Color de Fondo</label>
            <input
              type="color"
              value={String(block.style?.backgroundColor || (block.type === "button" ? "#06b6d4" : "#18181b"))}
              onChange={(e) => handleStyleChange("backgroundColor", e.target.value)}
              className="w-full h-8 bg-zinc-900 border border-zinc-700 rounded cursor-pointer p-0.5"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
