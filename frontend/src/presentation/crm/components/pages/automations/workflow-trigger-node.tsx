"use client"

import React from "react"
import { Zap, GripVertical } from "lucide-react"

interface WorkflowTriggerNodeProps {
  x: number
  y: number
  triggerEvent: string
  onMouseDown: (e: React.MouseEvent) => void
  onStartConnect: (e: React.MouseEvent) => void
}

export function WorkflowTriggerNode({
  x,
  y,
  triggerEvent,
  onMouseDown,
  onStartConnect,
}: WorkflowTriggerNodeProps) {
  return (
    <div
      style={{ transform: `translate3d(${x}px, ${y}px, 0)` }}
      className="absolute w-72 rounded-2xl border-2 border-emerald-500/80 p-4 bg-card/95 backdrop-blur-md shadow-2xl shadow-emerald-500/10 select-none z-10"
    >
      <div
        onMouseDown={onMouseDown}
        className="flex items-center justify-between border-b border-border/50 pb-2 mb-2 cursor-grab active:cursor-grabbing"
      >
        <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold uppercase tracking-wider">
          <GripVertical className="h-3.5 w-3.5 text-muted-foreground/60" />
          <Zap className="h-4 w-4" /> DISPARADOR (TRIGGER)
        </div>
        <span className="text-[10px] text-emerald-400/80 font-mono">INICIO</span>
      </div>

      <div className="space-y-1">
        <div className="font-semibold text-xs text-foreground truncate">{triggerEvent}</div>
        <p className="text-[11px] text-muted-foreground">Inicia el flujo cuando ocurre este evento</p>
      </div>

      {/* Output Port on Right */}
      <div
        onMouseDown={onStartConnect}
        className="absolute -right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-emerald-500 hover:bg-emerald-400 border-2 border-background shadow-md cursor-crosshair flex items-center justify-center transition-transform hover:scale-125"
        title="Arrastra para conectar el disparador al primer paso"
      >
        <div className="w-1.5 h-1.5 rounded-full bg-background" />
      </div>
    </div>
  )
}

export default WorkflowTriggerNode
