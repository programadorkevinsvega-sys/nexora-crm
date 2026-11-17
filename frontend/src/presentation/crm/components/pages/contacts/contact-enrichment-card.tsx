'use client'

import React, { useState } from 'react'
import { ApiEnrichmentRepository } from '@src/infrastructure/crm/repositories/enrichment/api-enrichment.repository'
import type { ContactEnrichmentResult } from '@crm/contracts'
import { Sparkles, CheckCircle2, ShieldAlert, Globe, Briefcase, ExternalLink } from 'lucide-react'

interface Props {
  contactId: string
  contactEmail?: string | null
}

export function ContactEnrichmentCard({ contactId }: Props) {
  const [data, setData] = useState<ContactEnrichmentResult | null>(null)
  const [loading, setLoading] = useState(false)

  const handleEnrich = async () => {
    setLoading(true)
    try {
      const res = await ApiEnrichmentRepository.enrichContact(contactId)
      setData(res)
    } catch (err: any) {
      alert(err.message || 'Error al enriquecer datos de contacto')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 space-y-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-blue-600" />
          Inteligencia LinkedIn & Email
        </h3>
        <button
          onClick={handleEnrich}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
        >
          <Sparkles className="w-3.5 h-3.5" />
          {loading ? 'Enriqueciendo...' : 'Enriquecer Perfil'}
        </button>
      </div>

      {!data ? (
        <div className="text-xs text-gray-500 py-2">
          Obtén automáticamente el perfil verificado de LinkedIn, cargo, nivel de antigüedad y calidad de correo corporativo.
        </div>
      ) : (
        <div className="space-y-3 pt-2 border-t border-gray-100 dark:border-gray-800 text-xs">
          {data.headline && (
            <div>
              <span className="text-gray-400 font-medium">Titular Profesional:</span>
              <p className="font-semibold text-gray-800 dark:text-gray-200 mt-0.5">{data.headline}</p>
            </div>
          )}

          <div className="flex flex-wrap gap-2 items-center">
            {data.seniority && (
              <span className="px-2 py-0.5 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-bold rounded-md">
                {data.seniority}
              </span>
            )}
            {data.industry && (
              <span className="px-2 py-0.5 bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 font-medium rounded-md">
                {data.industry}
              </span>
            )}
          </div>

          {data.emailValidation && (
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg flex items-center justify-between border border-emerald-100 dark:border-emerald-900">
              <div className="flex items-center gap-1.5">
                {data.emailValidation.isValid ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                )}
                <span className="text-emerald-900 dark:text-emerald-200 font-semibold">
                  Entregabilidad Email: {data.emailValidation.deliverabilityScore}%
                </span>
              </div>
              <span className="text-emerald-700 dark:text-emerald-400 font-medium">
                {data.emailValidation.isDisposable ? 'Desechable' : 'Verificado'}
              </span>
            </div>
          )}

          {data.skills && data.skills.length > 0 && (
            <div>
              <span className="text-gray-400 font-medium">Competencias Clave:</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {data.skills.map((s, i) => (
                  <span key={i} className="px-2 py-0.5 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded text-[11px]">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {data.linkedinProfileUrl && (
            <a
              href={data.linkedinProfileUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-blue-600 hover:underline font-semibold mt-1"
            >
              <ExternalLink className="w-3 h-3" /> Ver perfil profesional en LinkedIn
            </a>
          )}
        </div>
      )}
    </div>
  )
}
