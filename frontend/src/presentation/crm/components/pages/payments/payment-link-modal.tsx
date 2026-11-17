'use client'

import React, { useState } from 'react'
import { ApiPaymentsRepository } from '@src/infrastructure/crm/repositories/payments/api-payments.repository'
import type { PaymentGateway, PaymentTransaction } from '@crm/contracts'
import { CreditCard, Copy, Check, ExternalLink, X, ShieldCheck } from 'lucide-react'

interface Props {
  resourceType: 'QUOTE' | 'CONTRACT' | 'DEAL'
  resourceId: string
  amount: number
  currency?: string
  description: string
  customerEmail?: string
  onClose: () => void
}

export function PaymentLinkModal({
  resourceType,
  resourceId,
  amount,
  currency = 'USD',
  description,
  customerEmail,
  onClose,
}: Props) {
  const [gateway, setGateway] = useState<PaymentGateway>('STRIPE')
  const [loading, setLoading] = useState(false)
  const [transaction, setTransaction] = useState<PaymentTransaction | null>(null)
  const [copied, setCopied] = useState(false)

  const handleGenerate = async () => {
    setLoading(true)
    try {
      const tx = await ApiPaymentsRepository.createPaymentLink({
        resourceType,
        resourceId,
        amount,
        currency,
        gateway,
        description,
        customerEmail,
      })
      setTransaction(tx)
    } catch (err: any) {
      alert(err.message || 'Error al generar enlace de pago')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    if (!transaction) return
    navigator.clipboard.writeText(transaction.paymentUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
        <div className="flex justify-between items-center pb-2 border-b">
          <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-indigo-600" />
            Cobro con Pasarela de Pago
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3 bg-indigo-50 dark:bg-indigo-950/50 rounded-xl space-y-1">
          <div className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">Total a Cobrar:</div>
          <div className="text-xl font-extrabold text-indigo-950 dark:text-white">
            {amount.toLocaleString('es-ES', { minimumFractionDigits: 2 })} {currency}
          </div>
          <div className="text-xs text-gray-500">{description}</div>
        </div>

        {!transaction ? (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Selecciona la Pasarela:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['STRIPE', 'WOMPI', 'MERCADOPAGO'] as PaymentGateway[]).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGateway(g)}
                    className={`py-2 px-3 border rounded-xl text-xs font-bold transition-all ${
                      gateway === g
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-sm transition-colors flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              {loading ? 'Generando Enlace...' : 'Generar Link de Pago'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-3 border border-emerald-200 bg-emerald-50 rounded-xl space-y-2">
              <span className="text-xs font-bold text-emerald-800">✅ Link de Pago Generado:</span>
              <div className="text-xs text-emerald-900 break-all bg-white p-2 rounded-lg font-mono border border-emerald-100">
                {transaction.paymentUrl}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={copyToClipboard}
                className="flex-1 py-2 px-3 border border-gray-200 hover:bg-gray-50 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                {copied ? '¡Copiado!' : 'Copiar Link'}
              </button>
              <a
                href={transaction.paymentUrl}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <ExternalLink className="w-4 h-4" /> Pagar Ahora
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
