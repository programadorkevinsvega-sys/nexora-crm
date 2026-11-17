'use client'

import { Code2, Key, Shield, RefreshCw } from 'lucide-react'

const ENDPOINTS = [
  // Contactos
  { method: 'GET', path: '/api/v1/contacts', scope: 'contacts:read', desc: 'Listar contactos con paginación y filtros' },
  { method: 'GET', path: '/api/v1/contacts/:id', scope: 'contacts:read', desc: 'Consultar detalle completo de un contacto' },
  { method: 'POST', path: '/api/v1/contacts', scope: 'contacts:write', desc: 'Crear nuevo contacto comercial' },
  { method: 'PATCH', path: '/api/v1/contacts/:id', scope: 'contacts:write', desc: 'Actualizar datos de un contacto' },
  { method: 'DELETE', path: '/api/v1/contacts/:id', scope: 'contacts:write', desc: 'Eliminar un contacto' },
  { method: 'GET', path: '/api/v1/contacts/:id/360', scope: 'contacts:read', desc: 'Perfil unificado Customer 360' },

  // Empresas
  { method: 'GET', path: '/api/v1/companies', scope: 'companies:read', desc: 'Listar empresas con búsqueda' },
  { method: 'GET', path: '/api/v1/companies/:id', scope: 'companies:read', desc: 'Consultar información de una empresa' },
  { method: 'POST', path: '/api/v1/companies', scope: 'companies:write', desc: 'Registrar nueva empresa' },
  { method: 'PATCH', path: '/api/v1/companies/:id', scope: 'companies:write', desc: 'Actualizar empresa' },
  { method: 'DELETE', path: '/api/v1/companies/:id', scope: 'companies:write', desc: 'Eliminar empresa' },

  // Deals & Pipelines
  { method: 'GET', path: '/api/v1/deals', scope: 'deals:read', desc: 'Listar oportunidades de venta' },
  { method: 'GET', path: '/api/v1/deals/:id', scope: 'deals:read', desc: 'Consultar deal / oportunidad' },
  { method: 'POST', path: '/api/v1/deals', scope: 'deals:write', desc: 'Crear nueva oportunidad en pipeline' },
  { method: 'PATCH', path: '/api/v1/deals/:id', scope: 'deals:write', desc: 'Actualizar monto o datos de deal' },
  { method: 'POST', path: '/api/v1/deals/:id/stage', scope: 'deals:write', desc: 'Mover deal de etapa en Kanban' },
  { method: 'POST', path: '/api/v1/deals/:id/win', scope: 'deals:write', desc: 'Marcar oportunidad como GANADA (WON)' },
  { method: 'POST', path: '/api/v1/deals/:id/lose', scope: 'deals:write', desc: 'Marcar oportunidad como PERDIDA (LOST)' },
  { method: 'DELETE', path: '/api/v1/deals/:id', scope: 'deals:write', desc: 'Eliminar oportunidad' },

  // Interacciones
  { method: 'GET', path: '/api/v1/notes', scope: 'interactions:read', desc: 'Listar notas de contactos/deals' },
  { method: 'POST', path: '/api/v1/notes', scope: 'interactions:write', desc: 'Crear nota comercial' },
  { method: 'GET', path: '/api/v1/tasks', scope: 'interactions:read', desc: 'Listar tareas pendientes' },
  { method: 'POST', path: '/api/v1/tasks', scope: 'interactions:write', desc: 'Asignar nueva tarea' },
  { method: 'PATCH', path: '/api/v1/tasks/:id', scope: 'interactions:write', desc: 'Completar o actualizar tarea' },
  { method: 'GET', path: '/api/v1/calls', scope: 'interactions:read', desc: 'Historial de llamadas registradas' },
  { method: 'POST', path: '/api/v1/calls', scope: 'interactions:write', desc: 'Registrar registro de llamada' },

  // Soporte & Helpdesk
  { method: 'GET', path: '/api/v1/tickets', scope: 'tickets:read', desc: 'Listar tickets de soporte y SLA' },
  { method: 'GET', path: '/api/v1/tickets/:id', scope: 'tickets:read', desc: 'Consultar detalle de un ticket' },
  { method: 'POST', path: '/api/v1/tickets', scope: 'tickets:write', desc: 'Crear nuevo ticket de soporte' },
  { method: 'PATCH', path: '/api/v1/tickets/:id/status', scope: 'tickets:write', desc: 'Cambiar estado del ticket' },
  { method: 'POST', path: '/api/v1/tickets/:id/reply', scope: 'tickets:write', desc: 'Responder o añadir mensaje al ticket' },

  // Productos & CPQ
  { method: 'GET', path: '/api/v1/products', scope: 'quotes:read', desc: 'Catálogo de productos y listas de precios' },
  { method: 'GET', path: '/api/v1/products/:id', scope: 'quotes:read', desc: 'Consultar producto' },
  { method: 'POST', path: '/api/v1/products', scope: 'quotes:write', desc: 'Crear producto en catálogo' },
  { method: 'GET', path: '/api/v1/quotes', scope: 'quotes:read', desc: 'Listar cotizaciones dinámicas' },
  { method: 'GET', path: '/api/v1/quotes/:id', scope: 'quotes:read', desc: 'Consultar cotización con desglose' },
  { method: 'POST', path: '/api/v1/quotes', scope: 'quotes:write', desc: 'Generar nueva cotización CPQ' },
  { method: 'POST', path: '/api/v1/quotes/:id/accept', scope: 'quotes:write', desc: 'Aceptar cotización formal' },
  { method: 'POST', path: '/api/v1/quotes/:id/reject', scope: 'quotes:write', desc: 'Rechazar cotización' },

  // Contratos & Campañas
  { method: 'GET', path: '/api/v1/contracts', scope: 'contracts:read', desc: 'Listar contratos suscritos' },
  { method: 'GET', path: '/api/v1/contracts/:id', scope: 'contracts:read', desc: 'Consultar contrato comercial' },
  { method: 'POST', path: '/api/v1/contracts', scope: 'contracts:write', desc: 'Crear contrato y solicitar firma' },
  { method: 'GET', path: '/api/v1/campaigns', scope: 'campaigns:read', desc: 'Listar campañas de marketing' },
  { method: 'POST', path: '/api/v1/campaigns', scope: 'campaigns:write', desc: 'Crear campaña' },
  { method: 'POST', path: '/api/v1/campaigns/:id/members', scope: 'campaigns:write', desc: 'Añadir miembro a campaña' },

  // Scoring, KB & IA
  { method: 'GET', path: '/api/v1/scoring/leads/:contactId', scope: 'scoring:read', desc: 'Puntuación y temperatura del lead' },
  { method: 'POST', path: '/api/v1/scoring/leads/:contactId/recalculate', scope: 'scoring:write', desc: 'Recalcular score de lead' },
  { method: 'GET', path: '/api/v1/kb/categories', scope: 'kb:read', desc: 'Categorías de Base de Conocimiento' },
  { method: 'GET', path: '/api/v1/kb/articles', scope: 'kb:read', desc: 'Artículos publicados de ayuda' },
  { method: 'GET', path: '/api/v1/ai/deals/:dealId/win-probability', scope: 'ai:read', desc: 'Predicción de victoria en deal' },
  { method: 'POST', path: '/api/v1/ai/drafts/generate', scope: 'ai:write', desc: 'Generar borrador de mensaje con IA' },
  { method: 'GET', path: '/api/v1/ai/contacts/:contactId/summary', scope: 'ai:read', desc: 'Resumen ejecutivo con IA' },
  { method: 'GET', path: '/api/v1/ai/contacts/:contactId/churn-risk', scope: 'ai:read', desc: 'Predicción de riesgo de churn' },
]

const METHOD_COLORS: Record<string, string> = {
  GET: 'text-emerald-400 font-bold',
  POST: 'text-blue-400 font-bold',
  PATCH: 'text-amber-400 font-bold',
  DELETE: 'text-rose-400 font-bold',
}

export function DeveloperDocsTab() {
  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-steel bg-graphite p-4 space-y-1">
          <div className="flex items-center gap-2 text-signal-blue font-semibold text-sm">
            <Key size={16} /> Autenticación
          </div>
          <p className="text-xs text-ash">
            Envía tu API Key en <code className="text-paper bg-obsidian px-1 py-0.5 rounded">Authorization: Bearer nex_live_...</code> o <code className="text-paper bg-obsidian px-1 py-0.5 rounded">X-Api-Key</code>.
          </p>
        </div>

        <div className="rounded-xl border border-steel bg-graphite p-4 space-y-1">
          <div className="flex items-center gap-2 text-signal-blue font-semibold text-sm">
            <RefreshCw size={16} /> Rate Limit
          </div>
          <p className="text-xs text-ash">
            100 peticiones por minuto por cada clave activa, gestionado con Redis en tiempo real.
          </p>
        </div>

        <div className="rounded-xl border border-steel bg-graphite p-4 space-y-1">
          <div className="flex items-center gap-2 text-signal-blue font-semibold text-sm">
            <Shield size={16} /> Firma HMAC-SHA256
          </div>
          <p className="text-xs text-ash">
            Webhooks salientes con cabecera <code className="text-paper bg-obsidian px-1 py-0.5 rounded">X-Nexora-Signature: sha256=...</code>
          </p>
        </div>
      </div>

      {/* Full Endpoints Reference Table */}
      <div className="rounded-xl border border-steel bg-graphite p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-paper font-semibold text-sm">
            <Code2 size={16} className="text-signal-blue" />
            Catálogo Completo de Endpoints Públicos (/api/v1) — {ENDPOINTS.length} Operaciones
          </div>
        </div>

        <div className="overflow-x-auto max-h-[520px] overflow-y-auto pr-1">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-graphite border-b border-steel">
              <tr className="text-ash">
                <th className="text-left py-2 pr-4 font-medium uppercase">Método</th>
                <th className="text-left py-2 pr-4 font-medium uppercase">Endpoint</th>
                <th className="text-left py-2 pr-4 font-medium uppercase">Scope Requerido</th>
                <th className="text-left py-2 font-medium uppercase">Descripción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-steel/30">
              {ENDPOINTS.map((ep, idx) => (
                <tr key={idx} className="hover:bg-iron/30 transition-colors">
                  <td className={`py-2 pr-4 font-mono ${METHOD_COLORS[ep.method] || 'text-paper'}`}>{ep.method}</td>
                  <td className="py-2 pr-4 font-mono text-paper">{ep.path}</td>
                  <td className="py-2 pr-4 font-mono text-signal-blue">{ep.scope}</td>
                  <td className="py-2 text-ash">{ep.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Webhook Signature Verification Code Snippet */}
      <div className="rounded-xl border border-steel bg-graphite p-5 space-y-3">
        <p className="text-sm font-semibold text-paper">Ejemplo de Verificación de Firma HMAC (Node.js)</p>
        <pre className="bg-obsidian border border-steel p-3 rounded-lg text-xs font-mono text-ash overflow-x-auto">
{`const crypto = require('crypto');

function verifyWebhook(rawBody, signatureHeader, secret) {
  const expected = 'sha256=' + crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signatureHeader), Buffer.from(expected));
}`}
        </pre>
      </div>
    </div>
  )
}
