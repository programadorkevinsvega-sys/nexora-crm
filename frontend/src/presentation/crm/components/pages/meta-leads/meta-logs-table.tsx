"use client"

import React from "react"
import Link from "next/link"
import { Activity, User, Kanban, CheckCircle2, Clock, AlertTriangle } from "lucide-react"
import type { MetaLeadAdLog } from "@crm/contracts"

interface MetaLogsTableProps {
  logs: MetaLeadAdLog[]
}

export function MetaLogsTable({ logs }: MetaLogsTableProps) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5 shadow-lg space-y-4">
      <div className="flex items-center gap-2.5 border-b border-zinc-800/80 pb-3">
        <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <Activity className="h-4 w-4" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-zinc-100">Registro de Leads Entrantes en Tiempo Real</h4>
          <p className="text-xs text-zinc-400">
            Historial de prospectos capturados a través de Meta Lead Ads
          </p>
        </div>
      </div>

      {logs.length === 0 ? (
        <div className="p-8 text-center border border-dashed border-zinc-800 rounded-xl space-y-1">
          <p className="text-xs text-zinc-400">No se han recibido eventos de Meta Ads recientemente.</p>
          <p className="text-[11px] text-zinc-500">Usa el botón de prueba para simular una entrada en caliente.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-zinc-800 text-[11px] text-zinc-400 uppercase font-mono">
              <tr>
                <th className="py-2.5 px-3">Fecha & Hora</th>
                <th className="py-2.5 px-3">Campaña / Anuncio</th>
                <th className="py-2.5 px-3">Contacto CRM</th>
                <th className="py-2.5 px-3">Oportunidad (Deal)</th>
                <th className="py-2.5 px-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-850">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-zinc-900/40 transition">
                  <td className="py-3 px-3 text-zinc-400 whitespace-nowrap font-mono text-[11px]">
                    {new Date(log.receivedAt).toLocaleString()}
                  </td>
                  <td className="py-3 px-3">
                    <div className="space-y-0.5">
                      <span className="font-semibold text-zinc-100 block">{log.campaignName || "Campaña Facebook"}</span>
                      <span className="text-[11px] text-zinc-400">{log.adName || "Anuncio Feed"}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    {log.contactId ? (
                      <Link
                        href={`/contacts/${log.contactId}`}
                        className="inline-flex items-center gap-1.5 font-medium text-cyan-400 hover:text-cyan-300 transition"
                      >
                        <User className="h-3 w-3" />
                        <span>Ver Contacto</span>
                      </Link>
                    ) : (
                      <span className="text-zinc-500">—</span>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    {log.dealId ? (
                      <Link
                        href={`/pipelines/deals/${log.dealId}`}
                        className="inline-flex items-center gap-1.5 font-medium text-purple-400 hover:text-purple-300 transition"
                      >
                        <Kanban className="h-3 w-3" />
                        <span>Ver Deal</span>
                      </Link>
                    ) : (
                      <span className="text-zinc-500">—</span>
                    )}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <CheckCircle2 className="h-3 w-3" />
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
