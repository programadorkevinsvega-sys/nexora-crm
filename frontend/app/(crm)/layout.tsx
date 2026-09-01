"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { AuthProvider } from "@src/infrastructure/auth/auth-provider"
import { ErrorBoundary } from "@src/presentation/components/error-boundary"
import { Toaster } from "@src/presentation/components/toast"
import { registerDependencies } from "@src/application/crm/di/register"
import { CallProvider } from "@/src/application/crm/context/call-context"
import { CallWidget } from "@/src/presentation/crm/components/common/call-widget"
import { CommandPalette } from "@/src/presentation/crm/components/common/command-palette"
import { CrmSidebar } from "@/src/presentation/crm/components/layout/crm-sidebar"
import { CrmHeader } from "@/src/presentation/crm/components/layout/crm-header"

registerDependencies()

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
})

function CrmShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#080a0f] text-slate-100 antialiased">
      <CrmSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <CrmHeader />
        <main className="flex-1 overflow-auto p-4 sm:p-6 bg-gradient-to-b from-[#0a0d14] to-[#080a0f]">
          <div className="max-w-7xl mx-auto w-full space-y-6">{children}</div>
        </main>
      </div>
    </div>
  )
}

export default function CrmLayout({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <AuthProvider>
          <CallProvider>
            <CrmShell>{children}</CrmShell>
            <CommandPalette />
            <CallWidget />
            <Toaster />
          </CallProvider>
        </AuthProvider>
      </ErrorBoundary>
    </QueryClientProvider>
  )
}
