"use client"

import React, { useState } from "react"
import { Play, Plus, Zap, Sparkles, RefreshCw, ZoomIn, ZoomOut, Maximize2 } from "lucide-react"
import { Button } from "@/src/presentation/crm/components/ui/Button"
import { Badge } from "@/src/presentation/crm/components/ui/Badge"
import { WorkflowNodeCard } from "./workflow-node-card"
import { WorkflowPalette } from "./workflow-palette"
import type { WorkflowStep, WorkflowDefinition } from "@/src/domain/crm/automation/workflow.entity"

interface WorkflowCanvasProps {
  workflow: Partial<WorkflowDefinition>
  steps: WorkflowStep[]
  onChangeSteps: (steps: WorkflowStep[]) => void
}

export function WorkflowCanvas({ workflow, steps, onChangeSteps }: WorkflowCanvasProps) {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null)
  const [showPalette, setShowPalette] = useState(false)
  const [zoom, setZoom] = useState(100)
  const [simulatingStep, setSimulatingStep] = useState<number | null>(null)

  const handleAddStep = (partial: Partial<WorkflowStep>) => {
    const newStep: WorkflowStep = {
      id: `step_${Date.now()}`,
      type: partial.type || "ACTION",
      action: partial.action,
      name: partial.name || "Nuevo Paso",
      duration: partial.duration,
      config: {},
    }
    onChangeSteps([...steps, newStep])
    setSelectedIdx(steps.length)
    setShowPalette(false)
  }

  const handleDeleteStep = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation()
    const updated = steps.filter((_, i) => i !== idx)
    onChangeSteps(updated)
    if (selectedIdx === idx) setSelectedIdx(null)
  }

  const handleSimulate = () => {
    if (steps.length === 0) return
    let current = 0
    setSimulatingStep(0)

    const interval = setInterval(() => {
      current++
      if (current >= steps.length) {
        clearInterval(interval)
        setTimeout(() => setSimulatingStep(null), 1200)
      } else {
        setSimulatingStep(current)
      }
    }, 1200)
  }

  return (
    <div className="relative w-full h-[680px] bg-[#090a0f] border-2 border-border rounded-2xl overflow-hidden shadow-2xl flex flex-col">
      {/* Top Toolbar */}
      <div className="h-14 border-b border-border/80 bg-card/60 backdrop-blur-md px-4 flex items-center justify-between z-20">
        <div className="flex items-center gap-2">
          <Badge variant="default" className="bg-primary/10 text-primary border-primary/20 text-xs">
            🎨 Canvas Activo (Visual Drag & Drop)
          </Badge>
          <span className="text-xs text-muted-foreground font-mono">
            {steps.length} {steps.length === 1 ? "nodo" : "nodos"} conectados
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="text-xs h-8 text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/10"
            onClick={handleSimulate}
            disabled={simulatingStep !== null || steps.length === 0}
          >
            <Play className="h-3.5 w-3.5 mr-1" />
            {simulatingStep !== null ? `Ejecutando Paso ${simulatingStep + 1}...` : "Simular Flujo"}
          </Button>

          <Button
            size="sm"
            variant={showPalette ? "default" : "outline"}
            className="text-xs h-8"
            onClick={() => setShowPalette(!showPalette)}
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Agregar Bloque
          </Button>

          <div className="flex items-center bg-background/80 border rounded-lg p-0.5">
            <button onClick={() => setZoom(Math.max(60, zoom - 10))} className="p-1 hover:bg-muted rounded text-xs text-muted-foreground">
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <span className="text-[11px] font-mono px-1.5 text-muted-foreground">{zoom}%</span>
            <button onClick={() => setZoom(Math.min(140, zoom + 10))} className="p-1 hover:bg-muted rounded text-xs text-muted-foreground">
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Canvas Area with Grid Background */}
      <div className="relative flex-1 overflow-auto p-8 flex justify-center bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:20px_20px]">
        <div
          style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top center" }}
          className="flex flex-col items-center space-y-8 transition-transform duration-150 py-4 w-full max-w-xl"
        >
          {/* Trigger Node at Root */}
          <div className="relative w-72 rounded-xl border-2 border-emerald-500/60 p-4 bg-card shadow-lg shadow-emerald-500/10 text-center space-y-1.5">
            <div className="flex items-center justify-center gap-1.5 text-emerald-500 text-xs font-bold uppercase tracking-wider">
              <Zap className="h-4 w-4" /> DISPARADOR DEL FLUJO (TRIGGER)
            </div>
            <div className="font-semibold text-sm text-foreground">
              {workflow.triggerEvent || "crm.contact.created"}
            </div>
            <p className="text-[11px] text-muted-foreground">Dispara el flujo cuando ocurre este evento en el CRM</p>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-background shadow" />
          </div>

          {/* SVG Connector Line */}
          {steps.length > 0 && (
            <div className="w-0.5 h-8 bg-gradient-to-b from-emerald-500 to-cyan-500 shadow-sm" />
          )}

          {/* Nodes sequence */}
          {steps.map((step, idx) => (
            <React.Fragment key={step.id}>
              <WorkflowNodeCard
                step={step}
                index={idx}
                isSelected={selectedIdx === idx}
                isSimulating={simulatingStep === idx}
                onClick={() => setSelectedIdx(idx)}
                onDelete={(e) => handleDeleteStep(idx, e)}
              />

              {idx < steps.length - 1 && (
                <div className="w-0.5 h-8 bg-gradient-to-b from-cyan-500 to-cyan-400" />
              )}
            </React.Fragment>
          ))}

          {/* Add Step Dropzone */}
          <button
            onClick={() => setShowPalette(true)}
            className="w-64 border-2 border-dashed border-border/80 hover:border-primary/60 p-3.5 rounded-xl text-center text-xs text-muted-foreground hover:text-primary transition-all flex items-center justify-center gap-2 group"
          >
            <Plus className="h-4 w-4 group-hover:scale-125 transition-transform text-primary" />
            <span>Agregar siguiente paso...</span>
          </button>
        </div>

        {/* Floating Palette Drawer */}
        {showPalette && (
          <div className="absolute top-4 right-4 z-30 animate-in fade-in slide-in-from-right-3 duration-200">
            <WorkflowPalette onAddStep={handleAddStep} />
          </div>
        )}
      </div>
    </div>
  )
}
