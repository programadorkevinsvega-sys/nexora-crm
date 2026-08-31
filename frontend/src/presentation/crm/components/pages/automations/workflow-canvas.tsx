"use client"

import React, { useState } from "react"
import { Play, Plus, Zap, ZoomIn, ZoomOut, Sparkles, Move } from "lucide-react"
import { Button } from "@/src/presentation/crm/components/ui/Button"
import { Badge } from "@/src/presentation/crm/components/ui/Badge"
import { WorkflowNodeCard } from "./workflow-node-card"
import { WorkflowPalette } from "./workflow-palette"
import { WorkflowNodeInspector } from "./workflow-node-inspector"
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
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null)

  const handleAddStep = (partial: Partial<WorkflowStep>) => {
    const newStep: WorkflowStep = {
      id: `step_${Date.now()}`,
      type: partial.type || "ACTION",
      action: partial.action,
      name: partial.name || "Nuevo Paso",
      duration: partial.duration || (partial.type === "DELAY" ? "1h" : undefined),
      condition: partial.type === "CONDITION" ? { field: "contact.leadScore", operator: "GREATER_THAN", value: 80 } : undefined,
      config: {},
    }
    const updated = [...steps, newStep]
    onChangeSteps(updated)
    setSelectedIdx(updated.length - 1)
    setShowPalette(false)
  }

  const handleUpdateStep = (idx: number, updated: WorkflowStep) => {
    const next = [...steps]
    next[idx] = updated
    onChangeSteps(next)
  }

  const handleDeleteStep = (idx: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    const updated = steps.filter((_, i) => i !== idx)
    onChangeSteps(updated)
    if (selectedIdx === idx) setSelectedIdx(null)
  }

  const handleDragStart = (idx: number) => setDraggedIdx(idx)
  const handleDragOver = (e: React.DragEvent) => e.preventDefault()
  const handleDropOn = (targetIdx: number) => {
    if (draggedIdx === null || draggedIdx === targetIdx) return
    const reordered = [...steps]
    const [moved] = reordered.splice(draggedIdx, 1)
    reordered.splice(targetIdx, 0, moved)
    onChangeSteps(reordered)
    setDraggedIdx(null)
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
    <div className="relative w-full h-[720px] bg-[#07080d] border-2 border-border/80 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
      {/* Top Toolbar */}
      <div className="h-14 border-b border-border/80 bg-card/70 backdrop-blur-md px-4 flex items-center justify-between z-20">
        <div className="flex items-center gap-2">
          <Badge variant="default" className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 text-xs">
            🎨 Canvas Visual Interactivo (ActiveCampaign / Make)
          </Badge>
          <span className="text-xs text-muted-foreground font-mono">
            {steps.length} {steps.length === 1 ? "nodo" : "nodos"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="text-xs h-8 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10"
            onClick={handleSimulate}
            disabled={simulatingStep !== null || steps.length === 0}
          >
            <Play className="h-3.5 w-3.5 mr-1" />
            {simulatingStep !== null ? `Simulando Paso ${simulatingStep + 1}...` : "Simular Flujo"}
          </Button>

          <Button
            size="sm"
            variant={showPalette ? "default" : "outline"}
            className="text-xs h-8"
            onClick={() => setShowPalette(!showPalette)}
          >
            <Plus className="h-3.5 w-3.5 mr-1" /> Agregar Bloque
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

      {/* Main Canvas & Inspector Container */}
      <div className="relative flex-1 flex overflow-hidden">
        {/* Infinite Grid Workspace */}
        <div className="flex-1 overflow-auto p-8 flex justify-center bg-[radial-gradient(#1e293b_1.5px,transparent_1.5px)] [background-size:24px_24px]">
          <div
            style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top center" }}
            className="flex flex-col items-center space-y-8 transition-transform duration-150 py-4 w-full max-w-xl"
          >
            {/* Trigger Root */}
            <div className="relative w-72 rounded-xl border-2 border-emerald-500/60 p-4 bg-card shadow-lg shadow-emerald-500/10 text-center space-y-1.5">
              <div className="flex items-center justify-center gap-1.5 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                <Zap className="h-4 w-4" /> DISPARADOR (TRIGGER)
              </div>
              <div className="font-semibold text-sm text-foreground">{workflow.triggerEvent || "crm.contact.created"}</div>
              <p className="text-[11px] text-muted-foreground">Evento de inicio automático en el CRM</p>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-background shadow" />
            </div>

            {steps.length > 0 && (
              <div className={`w-0.5 h-8 ${simulatingStep === 0 ? "bg-emerald-400 animate-pulse w-1" : "bg-gradient-to-b from-emerald-500 to-cyan-500"}`} />
            )}

            {/* Step Nodes */}
            {steps.map((step, idx) => (
              <React.Fragment key={step.id}>
                <div
                  draggable
                  onDragStart={() => handleDragStart(idx)}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDropOn(idx)}
                  className="cursor-move"
                >
                  <WorkflowNodeCard
                    step={step}
                    index={idx}
                    isSelected={selectedIdx === idx}
                    isSimulating={simulatingStep === idx}
                    onClick={() => setSelectedIdx(idx)}
                    onDelete={(e) => handleDeleteStep(idx, e)}
                  />
                </div>

                {idx < steps.length - 1 && (
                  <div className={`w-0.5 h-8 ${simulatingStep === idx + 1 ? "bg-emerald-400 animate-pulse w-1" : "bg-gradient-to-b from-cyan-500 to-cyan-400"}`} />
                )}
              </React.Fragment>
            ))}

            {/* Add Step Button */}
            <button
              onClick={() => setShowPalette(true)}
              className="w-64 border-2 border-dashed border-border/80 hover:border-primary/60 p-3.5 rounded-xl text-center text-xs text-muted-foreground hover:text-primary transition-all flex items-center justify-center gap-2 group"
            >
              <Plus className="h-4 w-4 group-hover:scale-125 transition-transform text-primary" />
              <span>Agregar siguiente paso...</span>
            </button>
          </div>
        </div>

        {/* Floating Palette */}
        {showPalette && (
          <div className="absolute top-4 right-4 z-30 animate-in fade-in slide-in-from-right-3 duration-200">
            <WorkflowPalette onAddStep={handleAddStep} />
          </div>
        )}

        {/* Inspector Sidebar */}
        {selectedIdx !== null && steps[selectedIdx] && (
          <WorkflowNodeInspector
            step={steps[selectedIdx]}
            index={selectedIdx}
            onUpdate={(u) => handleUpdateStep(selectedIdx, u)}
            onDelete={() => handleDeleteStep(selectedIdx)}
            onClose={() => setSelectedIdx(null)}
          />
        )}
      </div>
    </div>
  )
}

export default WorkflowCanvas
