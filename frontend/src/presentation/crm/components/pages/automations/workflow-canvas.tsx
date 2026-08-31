"use client"

import React, { useState, useRef, useEffect } from "react"
import { Play, Plus, ZoomIn, ZoomOut, Sparkles, Move, RefreshCw } from "lucide-react"
import { Button } from "@/src/presentation/crm/components/ui/Button"
import { Badge } from "@/src/presentation/crm/components/ui/Badge"
import { WorkflowNodeCard } from "./workflow-node-card"
import { WorkflowTriggerNode } from "./workflow-trigger-node"
import { WorkflowWire } from "./workflow-wire"
import { WorkflowPalette } from "./workflow-palette"
import { WorkflowNodeInspector } from "./workflow-node-inspector"
import type { CanvasNode, ConnectionWire, DraggingWireState } from "./workflow-types"
import type { WorkflowStep, WorkflowDefinition } from "@/src/domain/crm/automation/workflow.entity"

interface WorkflowCanvasProps {
  workflow: Partial<WorkflowDefinition>
  steps: WorkflowStep[]
  onChangeSteps: (steps: WorkflowStep[]) => void
}

export function WorkflowCanvas({ workflow, steps, onChangeSteps }: WorkflowCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [nodes, setNodes] = useState<CanvasNode[]>([])
  const [triggerPos, setTriggerPos] = useState({ x: 60, y: 220 })
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null)
  const [showPalette, setShowPalette] = useState(false)
  const [zoom, setZoom] = useState(100)
  const [simulatingStep, setSimulatingStep] = useState<number | null>(null)

  // Dragging states
  const [draggingNodeId, setDraggingNodeId] = useState<string | "trigger" | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [drawingWire, setDrawingWire] = useState<DraggingWireState | null>(null)

  // Initialize or update canvas 2D coordinates for steps
  useEffect(() => {
    const safeSteps = Array.isArray(steps) ? steps : []
    setNodes((prev) =>
      safeSteps.map((step, idx) => {
        const existing = prev.find((p) => p.id === step.id)
        return {
          ...step,
          x: existing?.x ?? 380 + idx * 320,
          y: existing?.y ?? 220 + (idx % 2 === 1 ? 40 : 0),
        }
      })
    )
  }, [Array.isArray(steps) ? steps.length : 0])

  // Mouse handlers for 2D Node Movement
  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const mouseX = (e.clientX - rect.left) / (zoom / 100)
    const mouseY = (e.clientY - rect.top) / (zoom / 100)

    if (draggingNodeId) {
      const newX = Math.max(20, mouseX - dragOffset.x)
      const newY = Math.max(20, mouseY - dragOffset.y)
      if (draggingNodeId === "trigger") {
        setTriggerPos({ x: newX, y: newY })
      } else {
        setNodes((prev) =>
          prev.map((n) => (n.id === draggingNodeId ? { ...n, x: newX, y: newY } : n))
        )
      }
    }

    if (drawingWire) {
      setDrawingWire({ ...drawingWire, currentX: mouseX, currentY: mouseY })
    }
  }

  const handleCanvasMouseUp = () => {
    if (draggingNodeId && draggingNodeId !== "trigger") {
      onChangeSteps(nodes.map(({ x, y, ...rest }) => ({ ...rest, config: { ...rest.config, x, y } })))
    }
    setDraggingNodeId(null)
    setDrawingWire(null)
  }

  const handleStartDragNode = (id: string | "trigger", e: React.MouseEvent, currentX: number, currentY: number) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const mouseX = (e.clientX - rect.left) / (zoom / 100)
    const mouseY = (e.clientY - rect.top) / (zoom / 100)
    setDraggingNodeId(id)
    setDragOffset({ x: mouseX - currentX, y: mouseY - currentY })
  }

  // Connection Wires creation & deletion
  const handleStartConnect = (fromNodeId: string, port: "output" | "true" | "false", startX: number, startY: number) => {
    setDrawingWire({ fromNodeId, fromPort: port, startX, startY, currentX: startX, currentY: startY })
  }

  const handleConnectToNode = (targetNodeId: string) => {
    if (!drawingWire || drawingWire.fromNodeId === targetNodeId) return
    const safeSteps = Array.isArray(steps) ? steps : []
    const updated = safeSteps.map((s) => {
      if (s.id === drawingWire.fromNodeId) {
        if (drawingWire.fromPort === "true") return { ...s, onTrueStepId: targetNodeId }
        if (drawingWire.fromPort === "false") return { ...s, onFalseStepId: targetNodeId }
        return { ...s, nextStepId: targetNodeId }
      }
      return s
    })
    onChangeSteps(updated)
    setDrawingWire(null)
  }

  const handleDisconnect = (fromId: string, port: "output" | "true" | "false") => {
    const safeSteps = Array.isArray(steps) ? steps : []
    const updated = safeSteps.map((s) => {
      if (s.id === fromId) {
        if (port === "true") return { ...s, onTrueStepId: undefined }
        if (port === "false") return { ...s, onFalseStepId: undefined }
        return { ...s, nextStepId: undefined }
      }
      return s
    })
    onChangeSteps(updated)
  }

  const handleAddStep = (partial: Partial<WorkflowStep>) => {
    const lastNode = nodes[nodes.length - 1]
    const newX = lastNode ? lastNode.x + 320 : 380
    const newY = lastNode ? lastNode.y : 220
    const newStep: WorkflowStep = {
      id: `step_${Date.now()}`,
      type: partial.type || "ACTION",
      action: partial.action,
      name: partial.name || "Nuevo Paso",
      duration: partial.duration || (partial.type === "DELAY" ? "1h" : undefined),
      condition: partial.type === "CONDITION" ? { field: "contact.leadScore", operator: "GREATER_THAN", value: 80 } : undefined,
      config: { x: newX, y: newY },
    }
    const nextSteps = [...steps, newStep]
    onChangeSteps(nextSteps)
    setSelectedIdx(nextSteps.length - 1)
    setShowPalette(false)
  }

  const handleSimulate = () => {
    if (nodes.length === 0) return
    let current = 0
    setSimulatingStep(0)
    const interval = setInterval(() => {
      current++
      if (current >= nodes.length) {
        clearInterval(interval)
        setTimeout(() => setSimulatingStep(null), 1200)
      } else {
        setSimulatingStep(current)
      }
    }, 1200)
  }

  return (
    <div className="relative w-full h-[calc(100vh-11rem)] min-h-[640px] bg-[#05070e] border-2 border-border/80 rounded-2xl overflow-hidden shadow-2xl flex flex-col select-none">
      {/* Top Controls Toolbar */}
      <div className="h-14 border-b border-border/80 bg-card/75 backdrop-blur-md px-5 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <Badge variant="default" className="bg-cyan-500/10 text-cyan-400 border-cyan-500/30 text-xs px-3 py-1 font-semibold">
            🎨 Lienzo Visual 2D (Estilo n8n & Make)
          </Badge>
          <span className="text-xs text-muted-foreground font-mono">
            {nodes.length} nodos • Mueve libremente las tarjetas y conecta sus puertos
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="text-xs h-8 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10" onClick={handleSimulate} disabled={simulatingStep !== null || nodes.length === 0}>
            <Play className="h-3.5 w-3.5 mr-1" />
            {simulatingStep !== null ? `Ejecutando Paso ${simulatingStep + 1}...` : "Simular Flujo"}
          </Button>

          <Button size="sm" variant={showPalette ? "default" : "outline"} className="text-xs h-8" onClick={() => setShowPalette(!showPalette)}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Agregar Bloque
          </Button>

          <div className="flex items-center bg-background/80 border rounded-lg p-0.5">
            <button onClick={() => setZoom(Math.max(50, zoom - 10))} className="p-1 hover:bg-muted rounded text-xs text-muted-foreground"><ZoomOut className="h-3.5 w-3.5" /></button>
            <span className="text-[11px] font-mono px-1.5 text-muted-foreground">{zoom}%</span>
            <button onClick={() => setZoom(Math.min(150, zoom + 10))} className="p-1 hover:bg-muted rounded text-xs text-muted-foreground"><ZoomIn className="h-3.5 w-3.5" /></button>
          </div>
        </div>
      </div>

      {/* 2D Canvas Area */}
      <div className="relative flex-1 flex overflow-hidden">
        <div
          ref={containerRef}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          className="relative flex-1 w-full h-full overflow-auto bg-[radial-gradient(#1e293b_1.5px,transparent_1.5px)] [background-size:28px_28px]"
        >
          <div style={{ transform: `scale(${zoom / 100})`, transformOrigin: "0 0", minWidth: 2600, minHeight: 1800 }} className="relative w-full h-full">
            {/* SVG Bézier Cables Layer */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
              {/* Trigger to first step wire */}
              {nodes[0] && (
                <WorkflowWire id="wire_trigger" startX={triggerPos.x + 288} startY={triggerPos.y + 42} endX={nodes[0].x} endY={nodes[0].y + 42} isSimulating={simulatingStep === 0} />
              )}

              {/* Node-to-node wires */}
              {nodes.map((node, idx) => {
                const targetNode = node.nextStepId ? nodes.find((n) => n.id === node.nextStepId) : (node.type !== "CONDITION" ? nodes[idx + 1] : undefined)
                const trueTarget = node.onTrueStepId ? nodes.find((n) => n.id === node.onTrueStepId) : undefined
                const falseTarget = node.onFalseStepId ? nodes.find((n) => n.id === node.onFalseStepId) : undefined

                return (
                  <React.Fragment key={node.id}>
                    {targetNode && (
                      <WorkflowWire id={`wire_${node.id}`} startX={node.x + 256} startY={node.y + 42} endX={targetNode.x} endY={targetNode.y + 42} isSimulating={simulatingStep === idx + 1} onDelete={() => handleDisconnect(node.id, "output")} />
                    )}
                    {trueTarget && (
                      <WorkflowWire id={`wire_true_${node.id}`} startX={node.x + 256} startY={node.y + 28} endX={trueTarget.x} endY={trueTarget.y + 42} portType="true" isSimulating={simulatingStep === idx + 1} onDelete={() => handleDisconnect(node.id, "true")} />
                    )}
                    {falseTarget && (
                      <WorkflowWire id={`wire_false_${node.id}`} startX={node.x + 256} startY={node.y + 56} endX={falseTarget.x} endY={falseTarget.y + 42} portType="false" isSimulating={simulatingStep === idx + 1} onDelete={() => handleDisconnect(node.id, "false")} />
                    )}
                  </React.Fragment>
                )
              })}

              {/* In-flight drawing wire */}
              {drawingWire && (
                <WorkflowWire id="drawing_wire" startX={drawingWire.startX} startY={drawingWire.startY} endX={drawingWire.currentX} endY={drawingWire.currentY} portType={drawingWire.fromPort} />
              )}
            </svg>

            {/* Trigger Root Card */}
            <WorkflowTriggerNode x={triggerPos.x} y={triggerPos.y} triggerEvent={workflow.triggerEvent || "crm.contact.created"} onMouseDown={(e) => handleStartDragNode("trigger", e, triggerPos.x, triggerPos.y)} onStartConnect={(e) => handleStartConnect("trigger", "output", triggerPos.x + 288, triggerPos.y + 42)} />

            {/* Draggable Step Node Cards */}
            {nodes.map((node, idx) => (
              <WorkflowNodeCard
                key={node.id}
                node={node}
                index={idx}
                isSelected={selectedIdx === idx}
                isSimulating={simulatingStep === idx}
                onClick={() => setSelectedIdx(idx)}
                onDelete={(e) => { e.stopPropagation(); onChangeSteps(steps.filter((_, i) => i !== idx)); if (selectedIdx === idx) setSelectedIdx(null) }}
                onMouseDownCard={(e) => handleStartDragNode(node.id, e, node.x, node.y)}
                onStartConnect={(port, e) => handleStartConnect(node.id, port, node.x + 256, node.y + (port === "true" ? 28 : port === "false" ? 56 : 42))}
                onDropConnect={() => handleConnectToNode(node.id)}
              />
            ))}
          </div>
        </div>

        {/* Floating Palette */}
        {showPalette && (
          <div className="absolute top-4 right-4 z-30 animate-in fade-in slide-in-from-right-3 duration-200">
            <WorkflowPalette onAddStep={handleAddStep} />
          </div>
        )}

        {/* Inspector Sidebar */}
        {selectedIdx !== null && nodes[selectedIdx] && (
          <WorkflowNodeInspector
            step={nodes[selectedIdx]}
            index={selectedIdx}
            onUpdate={(u) => {
              const safe = Array.isArray(steps) ? steps : []
              onChangeSteps(safe.map((s, i) => (i === selectedIdx ? u : s)))
            }}
            onDelete={() => {
              const safe = Array.isArray(steps) ? steps : []
              onChangeSteps(safe.filter((_, i) => i !== selectedIdx))
              setSelectedIdx(null)
            }}
            onClose={() => setSelectedIdx(null)}
          />
        )}
      </div>
    </div>
  )
}

export default WorkflowCanvas
