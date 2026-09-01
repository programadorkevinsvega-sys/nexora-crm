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
    <div className="flex h-screen w-screen overflow-hidden bg-[#08090a] text-[#d0d6e0] antialiased">
      <CrmSidebar />
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <CrmHeader />
        <main className="flex-1 overflow-auto bg-[#08090a] p-6">
          <div className="max-w-[1200px] mx-auto w-full space-y-6">{children}</div>
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
