"use client"

import React, { useState } from "react"
import { Sparkles, RefreshCw, Send, Play } from "lucide-react"

import { PageHeader } from "@/src/presentation/crm/components/common/PageHeader"
import { Button } from "@/src/presentation/crm/components/ui/Button"
import { Skeleton } from "@/src/presentation/crm/components/ui/Skeleton"
import {
  useMetaStatus, useMetaCallback, useMetaSyncForms,
  useMetaDisconnect, useMetaLogs,
} from "@/src/application/crm/di/hooks"
import { MetaConnectModal } from "./meta-connect-modal"
import { MetaConnectCard } from "./meta-connect-card"
import { MetaFormsSync } from "./meta-forms-sync"
import { MetaPipelineConfig } from "./meta-pipeline-config"
import { MetaLogsTable } from "./meta-logs-table"
import { MetaSimulateModal } from "./meta-simulate-modal"

export function MetaLeadsPage() {
  const { data: integration, isLoading } = useMetaStatus()
  const { mutate: connectMeta, isPending: isConnecting } = useMetaCallback()
  const { mutate: syncForms, isPending: isSyncing } = useMetaSyncForms()
  const { mutate: disconnectMeta } = useMetaDisconnect()
  const { data: logsResult } = useMetaLogs()

  const [showSimulateModal, setShowSimulateModal] = useState(false)
  const [showConnectModal, setShowConnectModal] = useState(false)

  if (isLoading) return <Skeleton className="h-96 w-full rounded-2xl" />

  const logs = Array.isArray(logsResult) ? logsResult : []

  const handleConnect = () => {
    setShowConnectModal(true)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Meta Business Suite & Facebook Lead Ads"
        description="Captura leads instantáneos desde tus campañas de Facebook e Instagram directo al CRM con enrutamiento automático a Pipelines."
        breadcrumb={[
          { label: "Integraciones", href: "/settings/developer" },
          { label: "Facebook Lead Ads" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSimulateModal(true)}
              className="gap-2 text-xs text-purple-300 border-purple-800/40 hover:bg-purple-950/30"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              Simular Lead de Prueba
            </Button>
          </div>
        }
      />

      {/* Main Connection Status Card */}
      {integration && (
        <MetaConnectCard
          integration={integration}
          onConnect={handleConnect}
          onDisconnect={() => disconnectMeta()}
          isConnecting={isConnecting}
        />
      )}

      {/* When Connected: Show Sync Forms, Pipeline Router, and Live Feed */}
      {integration && integration.status === "CONNECTED" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <MetaFormsSync
              forms={integration.leadGenForms || []}
              onSync={() => syncForms()}
              isSyncing={isSyncing}
              lastSyncAt={integration.lastSyncAt}
            />

            <MetaPipelineConfig integration={integration} />
          </div>

          <MetaLogsTable logs={logs} />
        </div>
      )}

      {/* Simulate Modal */}
      {showSimulateModal && (
        <MetaSimulateModal onClose={() => setShowSimulateModal(false)} />
      )}

      {/* Connect Modal */}
      {showConnectModal && (
        <MetaConnectModal onClose={() => setShowConnectModal(false)} onSuccess={() => setShowConnectModal(false)} />
      )}
    </div>
  )
}
export default MetaLeadsPage
