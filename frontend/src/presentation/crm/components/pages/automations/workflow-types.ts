import type { WorkflowStep, StepType } from "@/src/domain/crm/automation/workflow.entity"

export interface CanvasPosition {
  x: number
  y: number
}

export interface CanvasNode extends WorkflowStep {
  x: number
  y: number
}

export interface ConnectionWire {
  id: string
  fromNodeId: string
  fromPort: "output" | "true" | "false"
  toNodeId: string
  toPort: "input"
}

export interface DraggingWireState {
  fromNodeId: string
  fromPort: "output" | "true" | "false"
  startX: number
  startY: number
  currentX: number
  currentY: number
}
