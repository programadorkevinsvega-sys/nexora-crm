'use client'

import { useState } from 'react'
import { OrganizationSettingsTab } from './organization-settings-tab'
import { ProfileSettingsTab } from './profile-settings-tab'
import { TeamMembersSettingsTab } from './team-members-settings-tab'
import { SecuritySettingsTab } from './security-settings-tab'
import { NotificationsSettingsTab } from './notifications-settings-tab'
import { BillingSettingsTab } from './billing-settings-tab'
import { IntegrationsSettingsTab } from './integrations-settings-tab'
import { TagsSettingsTab } from './tags-settings-tab'
import { AuditLogsPage } from '../audit/audit-logs-page'
import { Building2, User, Users, Shield, Bell, CreditCard, Blocks, Tag, Code2, ShieldCheck } from 'lucide-react'
import Link from 'next/link'

type SettingsSection = 'org' | 'profile' | 'team' | 'security' | 'notifications' | 'billing' | 'integrations' | 'tags' | 'audit'

export function SettingsHubPage() {
  const [activeSection, setActiveSection] = useState<SettingsSection>('org')

  const navItems: { id: SettingsSection; label: string; icon: any; desc: string }[] = [
    { id: 'org', label: 'Organización', icon: Building2, desc: 'Empresa, moneda y zona horaria' },
    { id: 'profile', label: 'Mi Perfil', icon: User, desc: 'Datos personales y firma de email' },
    { id: 'team', label: 'Equipo & Roles', icon: Users, desc: 'Miembros, permisos y RBAC' },
    { id: 'security', label: 'Seguridad & 2FA', icon: Shield, desc: 'Autenticación y sesiones' },
    { id: 'notifications', label: 'Notificaciones', icon: Bell, desc: 'Canales y reglas de alerta' },
    { id: 'billing', label: 'Facturación & Plan', icon: CreditCard, desc: 'Suscripción, cuotas y recibos' },
    { id: 'integrations', label: 'Integraciones', icon: Blocks, desc: 'WhatsApp, SES, Stripe y apps' },
    { id: 'tags', label: 'Etiquetas', icon: Tag, desc: 'Clasificación de contactos y tratos' },
    { id: 'audit', label: 'Auditoría & Logs', icon: ShieldCheck, desc: 'Trazabilidad de cambios y eventos' },
  ]

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-paper flex items-center gap-2">
            Centro de Control & Configuración
          </h1>
          <p className="text-sm text-ash mt-0.5">
            Administra tu organización, usuarios, parámetros comerciales, seguridad y servicios conectados.
          </p>
        </div>

        {/* Quick developer link */}
        <div className="flex items-center gap-3">
          <Link
            href="/settings/developer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-signal-blue/40 bg-signal-blue/10 text-xs text-signal-blue hover:bg-signal-blue/20 transition-colors font-medium"
          >
            <Code2 size={13} /> Portal Developer & MCP
          </Link>
        </div>
      </div>

      {/* Main Layout: Sidebar Nav + Active Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Navigation Column */}
        <nav className="lg:col-span-3 rounded-xl border border-border bg-card p-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeSection === item.id
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted font-medium'
                }`}
              >
                <Icon size={16} className={isActive ? 'text-primary-foreground' : 'text-primary'} />
                <div className="overflow-hidden">
                  <div className="text-xs truncate">{item.label}</div>
                  <div className={`text-[10px] truncate ${isActive ? 'opacity-80' : 'text-muted-foreground'}`}>
                    {item.desc}
                  </div>
                </div>
              </button>
            )
          })}
        </nav>

        {/* Dynamic Content Panel */}
        <main className="lg:col-span-9">
          {activeSection === 'org' && <OrganizationSettingsTab />}
          {activeSection === 'profile' && <ProfileSettingsTab />}
          {activeSection === 'team' && <TeamMembersSettingsTab />}
          {activeSection === 'security' && <SecuritySettingsTab />}
          {activeSection === 'notifications' && <NotificationsSettingsTab />}
          {activeSection === 'billing' && <BillingSettingsTab />}
          {activeSection === 'integrations' && <IntegrationsSettingsTab />}
          {activeSection === 'tags' && <TagsSettingsTab />}
          {activeSection === 'audit' && <AuditLogsPage />}
        </main>
      </div>
    </div>
  )
}

