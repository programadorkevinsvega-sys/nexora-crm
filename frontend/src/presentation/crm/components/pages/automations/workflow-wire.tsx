"use client"

import React, { useState } from "react"

interface WorkflowWireProps {
  id: string
  startX: number
  startY: number
  endX: number
  endY: number
  portType?: "output" | "true" | "false"
  isSimulating?: boolean
  onDelete?: () => void
}

export function WorkflowWire({
  id: _id,
  startX,
  startY,
  endX,
  endY,
  portType = "output",
  isSimulating = false,
  onDelete,
}: WorkflowWireProps) {
  const [isHovered, setIsHovered] = useState(false)

  // Cubic Bézier curve with horizontal handles (n8n/Make style)
  const deltaX = Math.abs(endX - startX) * 0.55
  const controlX1 = startX + Math.max(deltaX, 50)
  const controlY1 = startY
  const controlX2 = endX - Math.max(deltaX, 50)
  const controlY2 = endY

  const pathData = `M ${startX} ${startY} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${endX} ${endY}`
  const midX = (startX + endX) / 2
  const midY = (startY + endY) / 2

  const strokeColor =
    portType === "true"
      ? "#10b981" // emerald
      : portType === "false"
      ? "#ef4444" // red
      : isHovered
      ? "#38bdf8" // sky-400
      : isSimulating
      ? "#34d399" // emerald-400
      : "#0ea5e9" // cyan-500

  return (
    <g
      className="cursor-pointer group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Invisible thick hover hit area */}
      <path
        d={pathData}
        fill="none"
        stroke="transparent"
        strokeWidth={18}
        onClick={onDelete}
      />

      {/* Outer Glow on hover / simulation */}
      {(isHovered || isSimulating) && (
        <path
          d={pathData}
          fill="none"
          stroke={strokeColor}
          strokeWidth={6}
          strokeOpacity={0.4}
        />
      )}

      {/* Main Wire Line */}
      <path
        d={pathData}
        fill="none"
        stroke={strokeColor}
        strokeWidth={isHovered ? 3.5 : 2.5}
        strokeDasharray={isSimulating ? "8,6" : undefined}
        className={isSimulating ? "animate-[dash_1s_linear_infinite]" : ""}
      />

      {/* Port Type Label or Delete icon in center */}
      {isHovered && onDelete ? (
        <g transform={`translate(${midX - 10}, ${midY - 10})`} onClick={onDelete}>
          <circle r={11} cx={10} cy={10} fill="#ef4444" className="shadow-lg" />
          <text x={10} y={14} textAnchor="middle" fill="#ffffff" fontSize={11} fontWeight="bold">
            ×
          </text>
        </g>
      ) : (
        portType !== "output" && (
          <g transform={`translate(${startX + (endX - startX) * 0.25}, ${startY + (endY - startY) * 0.25})`}>
            <rect
              x={-14}
              y={-9}
              width={28}
              height={18}
              rx={5}
              fill={portType === "true" ? "#064e3b" : "#7f1d1d"}
              stroke={portType === "true" ? "#10b981" : "#ef4444"}
              strokeWidth={1}
            />
            <text
              x={0}
              y={4}
              textAnchor="middle"
              fill={portType === "true" ? "#a7f3d0" : "#fecaca"}
              fontSize={9}
              fontWeight="bold"
            >
              {portType === "true" ? "SÍ" : "NO"}
            </text>
          </g>
        )
      )}
    </g>
  )
}

export default WorkflowWire
