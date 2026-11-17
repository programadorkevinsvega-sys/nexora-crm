'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/src/presentation/crm/components/ui/Card'
import { Button } from '@/src/presentation/crm/components/ui/Button'
import { Input } from '@/src/presentation/crm/components/ui/Input'
import { useSession } from '@/src/infrastructure/auth/auth-provider'
import { ApiTenantConfigRepository } from '@/src/infrastructure/crm/repositories/tenant/api-tenant-config.repository'
import type { Branch, TenantTax, TenantCurrency } from '@crm/contracts'
import { Building2, ShieldCheck, MapPin, Receipt, Coins, Plus, Check } from 'lucide-react'

export function OrganizationSettingsTab() {
  const { session, setSession } = useSession()
  const [name, setName] = useState('')
  const [legalName, setLegalName] = useState('')
  const [taxId, setTaxId] = useState('')
  const [currency, setCurrency] = useState('USD')
  const [timeZone, setTimeZone] = useState('America/Bogota')
  const [saved, setSaved] = useState(false)

  const [branches, setBranches] = useState<Branch[]>([])
  const [taxes, setTaxes] = useState<TenantTax[]>([])
  const [currencies, setCurrencies] = useState<TenantCurrency[]>([])
  const [loadingExtensions, setLoadingExtensions] = useState(true)

  useEffect(() => {
    if (session) {
      setName(session.companyName || 'Mi Empresa')
      setLegalName(session.companyName ? `${session.companyName} S.A.S.` : '')
      loadExtensions()
    }
  }, [session])

  const loadExtensions = async () => {
    try {
      setLoadingExtensions(true)
      const [branchesData, taxesData, currenciesData] = await Promise.all([
        ApiTenantConfigRepository.listBranches().catch(() => []),
        ApiTenantConfigRepository.listTaxes().catch(() => []),
        ApiTenantConfigRepository.listCurrencies().catch(() => []),
      ])
      setBranches(branchesData || [])
      setTaxes(taxesData || [])
      setCurrencies(currenciesData || [])
    } finally {
      setLoadingExtensions(false)
    }
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (session) {
      setSession({ ...session, companyName: name })
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-card border border-border">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-border">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Building2 size={20} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground">Configuración de la Organización</h3>
              <p className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                <ShieldCheck size={14} /> Organización Activa & Aislada por RLS
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Nombre Comercial</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Razón Social</label>
              <Input value={legalName} onChange={(e) => setLegalName(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">NIT / Tax ID</label>
              <Input value={taxId} onChange={(e) => setTaxId(e.target.value)} placeholder="Ej. 900.123.456-7" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Zona Horaria Base</label>
              <Input value={timeZone} onChange={(e) => setTimeZone(e.target.value)} />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" className="bg-cyan-600 hover:bg-cyan-500 text-white gap-2 text-xs">
              {saved ? <Check size={14} /> : null} {saved ? 'Guardado' : 'Guardar Datos'}
            </Button>
          </div>
        </form>
      </Card>

      {/* Grid: Sucursales, Impuestos y Monedas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 1. Sucursales */}
        <Card className="p-5 bg-card border border-border space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-cyan-400" />
              <h4 className="text-sm font-bold text-foreground">Sedes & Sucursales</h4>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400">{branches.length} Sedes</span>
          </div>
          <div className="space-y-2 text-xs">
            {branches.map((b) => (
              <div key={b.id} className="p-2.5 rounded-lg bg-muted/40 border border-border flex items-center justify-between">
                <div>
                  <p className="font-semibold text-foreground">{b.name}</p>
                  <p className="text-[11px] text-muted-foreground">{[b.city, b.country].filter(Boolean).join(', ')}</p>
                </div>
                {b.isHeadquarters && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">HQ</span>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* 2. Impuestos */}
        <Card className="p-5 bg-card border border-border space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt size={16} className="text-emerald-400" />
              <h4 className="text-sm font-bold text-foreground">Impuestos & Retenciones</h4>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">{taxes.length} Reglas</span>
          </div>
          <div className="space-y-2 text-xs">
            {taxes.map((t) => (
              <div key={t.id} className="p-2.5 rounded-lg bg-muted/40 border border-border flex items-center justify-between">
                <div>
                  <p className="font-semibold text-foreground">{t.taxName}</p>
                  <span className="text-[10px] text-muted-foreground uppercase">{t.taxType}</span>
                </div>
                <span className="font-mono font-bold text-emerald-400 text-xs">{t.taxPercentage}%</span>
              </div>
            ))}
          </div>
        </Card>

        {/* 3. Monedas */}
        <Card className="p-5 bg-card border border-border space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Coins size={16} className="text-purple-400" />
              <h4 className="text-sm font-bold text-foreground">Divisas Comerciales</h4>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/10 text-purple-400">{currencies.length} Monedas</span>
          </div>
          <div className="space-y-2 text-xs">
            {currencies.map((c) => (
              <div key={c.id} className="p-2.5 rounded-lg bg-muted/40 border border-border flex items-center justify-between">
                <div>
                  <p className="font-semibold text-foreground">{c.name} ({c.isoCode})</p>
                  <p className="text-[11px] text-muted-foreground font-mono">Símbolo: {c.symbol}</p>
                </div>
                {c.isBaseCurrency && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">Base</span>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
export default OrganizationSettingsTab
