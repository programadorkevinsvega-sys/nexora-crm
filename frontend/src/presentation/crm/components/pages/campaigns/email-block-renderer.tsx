"use client"

import React from "react"
import { EmailBlock } from "./email-template-types"

interface Props {
  block: EmailBlock
  isSelected: boolean
  onClick: (id: string) => void
  onDragStart: (e: React.DragEvent, id: string) => void
  onDragOver: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent, id: string) => void
}

export function EmailBlockRenderer({ block, isSelected, onClick, onDragStart, onDragOver, onDrop }: Props) {
  const baseClasses = `relative border-2 p-3 rounded-lg cursor-move transition-all ${
    isSelected
      ? "border-cyan-500 bg-cyan-950/20 ring-2 ring-cyan-500/20"
      : "border-zinc-800/80 bg-zinc-900/50 hover:border-zinc-700"
  }`

  const renderContent = () => {
    switch (block.type) {
      case "text":
        return (
          <div style={block.style as React.CSSProperties} className="text-sm">
            {block.content || "Bloque de texto..."}
          </div>
        )
      case "image":
        return (
          <div style={{ textAlign: (block.style?.textAlign as any) || "center" }}>
            {block.url ? (
              <img
                src={block.url}
                alt={block.altText || ""}
                style={{ ...(block.style as React.CSSProperties), maxWidth: "100%", height: "auto" }}
                className="rounded-lg inline-block"
              />
            ) : (
              <div className="bg-zinc-900 border border-zinc-800 p-8 text-center text-zinc-500 rounded-lg text-xs">
                🖼️ Imagen de Portada / Banner (Ingresa URL en el inspector)
              </div>
            )}
          </div>
        )
      case "button":
        return (
          <div style={{ textAlign: (block.style?.textAlign as any) || "center" }}>
            <button
              type="button"
              style={{
                ...(block.style as React.CSSProperties),
                padding: "10px 24px",
                cursor: "pointer",
                border: "none",
                borderRadius: "8px",
                fontWeight: "bold",
                backgroundColor: (block.style?.backgroundColor as string) || "#06b6d4",
                color: (block.style?.color as string) || "#ffffff",
              }}
              className="text-xs shadow-md"
            >
              {block.content || "Botón de Acción CTA"}
            </button>
          </div>
        )
      case "spacer":
        return (
          <div
            style={{ height: block.style?.height || "24px" }}
            className="w-full bg-zinc-900/30 border border-dashed border-zinc-800 rounded flex items-center justify-center text-[10px] text-zinc-600 font-mono"
          >
            Espaciador ({block.style?.height || "24px"})
          </div>
        )
      case "divider":
        return (
          <hr
            style={{ ...(block.style as React.CSSProperties), borderTop: "1px solid #27272a", borderBottom: "none" }}
          />
        )
      default:
        return <div className="text-xs text-zinc-500">Bloque Desconocido</div>
    }
  }

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, block.id)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, block.id)}
      onClick={() => onClick(block.id)}
      className={baseClasses}
    >
      {renderContent()}
    </div>
  )
}
