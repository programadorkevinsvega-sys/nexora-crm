"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import {
  User, Mail, Phone, ExternalLink, GitFork, Star,
  ChevronDown, ChevronRight, MoreVertical, Plus
} from "lucide-react"
import { SENIORITY_CONFIG, type OrgNode } from "./org-chart-types"

interface OrgChartNodeCardProps {
  node: OrgNode
  onReassign: (node: OrgNode) => void
  onAddSubordinate?: (parentNode: OrgNode) => void
  isHighlighted?: boolean
}

export function OrgChartNodeCard({
  node,
  onReassign,
  onAddSubordinate,
  isHighlighted = false,
}: OrgChartNodeCardProps) {
  const router = useRouter()
  const [showMenu, setShowMenu] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  const { contact, seniorityLevel, department, directReports, totalSubordinatesCount } = node
  const seniority = SENIORITY_CONFIG[seniorityLevel] || SENIORITY_CONFIG.INDIVIDUAL_CONTRIBUTOR

  const fullName = `${contact.firstName} ${contact.lastName || ""}`.trim()
  const initials = `${contact.firstName[0] || ""}${contact.lastName?.[0] || ""}`.toUpperCase()

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    router.push(`/contacts/${contact.id}/360`)
  }

  return (
    <div className="flex flex-col items-center group relative">
      {/* Node Container */}
      <div
        className={`w-72 rounded-xl border p-4 bg-zinc-900/90 backdrop-blur-md shadow-lg transition-all duration-200 hover:shadow-cyan-500/10 hover:border-cyan-500/40 relative z-10 cursor-pointer ${
          isHighlighted
            ? "ring-2 ring-cyan-400 border-cyan-400 shadow-cyan-500/30 scale-105"
            : "border-zinc-800"
        }`}
        onClick={handleCardClick}
      >
        {/* Top Header: Seniority Badge & Actions */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border uppercase tracking-wider ${seniority.badgeColor}`}>
            {seniority.label}
          </span>
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowMenu(!showMenu)
              }}
              className="p-1 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition"
              title="Opciones"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
            {showMenu && (
              <div
                className="absolute right-0 top-6 w-48 rounded-lg border border-zinc-800 bg-zinc-950 p-1.5 shadow-2xl z-50 text-xs space-y-0.5"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => {
                    setShowMenu(false)
                    router.push(`/contacts/${contact.id}/360`)
                  }}
                  className="flex w-full items-center gap-2 px-2.5 py-1.5 rounded-md hover:bg-zinc-800 text-zinc-200"
                >
                  <ExternalLink className="h-3.5 w-3.5 text-cyan-400" />
                  Ver Ficha 360°
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false)
                    onReassign(node)
                  }}
                  className="flex w-full items-center gap-2 px-2.5 py-1.5 rounded-md hover:bg-zinc-800 text-zinc-200"
                >
                  <GitFork className="h-3.5 w-3.5 text-purple-400" />
                  Reasignar Jerarquía
                </button>
                {onAddSubordinate && (
                  <button
                    onClick={() => {
                      setShowMenu(false)
                      onAddSubordinate(node)
                    }}
                    className="flex w-full items-center gap-2 px-2.5 py-1.5 rounded-md hover:bg-zinc-800 text-zinc-200"
                  >
                    <Plus className="h-3.5 w-3.5 text-emerald-400" />
                    Añadir Subordinado
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Contact Info */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-inner">
              {initials || <User className="h-5 w-5" />}
            </div>
            {contact.isStarred && (
              <div className="absolute -top-1 -right-1 bg-amber-500 rounded-full p-0.5 shadow">
                <Star className="h-2.5 w-2.5 text-zinc-950 fill-zinc-950" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-semibold text-zinc-100 truncate flex items-center gap-1.5">
              {fullName}
            </h4>
            <p className="text-xs text-cyan-300/90 font-medium truncate">
              {contact.jobTitle || "Sin cargo registrado"}
            </p>
            <p className="text-[11px] text-zinc-400 truncate">
              {department}
            </p>
          </div>
        </div>

        {/* Channels */}
        <div className="mt-3 pt-2.5 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            {contact.email && (
              <a
                href={`mailto:${contact.email}`}
                onClick={(e) => e.stopPropagation()}
                className="hover:text-cyan-400 transition"
                title={contact.email}
              >
                <Mail className="h-3.5 w-3.5" />
              </a>
            )}
            {contact.phone && (
              <a
                href={`tel:${contact.phone}`}
                onClick={(e) => e.stopPropagation()}
                className="hover:text-emerald-400 transition"
                title={contact.phone}
              >
                <Phone className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
          {totalSubordinatesCount > 0 && (
            <span className="text-[11px] font-medium text-purple-300 bg-purple-950/40 px-2 py-0.5 rounded-full border border-purple-800/40">
              {totalSubordinatesCount} {totalSubordinatesCount === 1 ? "reporte" : "reportes"}
            </span>
          )}
        </div>
      </div>

      {/* Expand / Collapse Branch Toggle */}
      {directReports.length > 0 && (
        <div className="mt-2 relative z-20">
          <button
            onClick={(e) => {
              e.stopPropagation()
              setCollapsed(!collapsed)
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] font-medium border border-zinc-700 transition shadow"
          >
            {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            <span>{directReports.length} {directReports.length === 1 ? "área" : "áreas"}</span>
          </button>
        </div>
      )}

      {/* Subordinates Recursive Tree */}
      {!collapsed && directReports.length > 0 && (
        <div className="mt-6 pt-4 relative flex items-start justify-center gap-8 before:absolute before:top-0 before:left-1/2 before:-translate-x-1/2 before:w-px before:h-4 before:bg-zinc-700">
          {directReports.map((child) => (
            <div key={child.contact.id} className="relative flex flex-col items-center">
              <OrgChartNodeCard
                node={child}
                onReassign={onReassign}
                onAddSubordinate={onAddSubordinate}
                isHighlighted={isHighlighted}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
