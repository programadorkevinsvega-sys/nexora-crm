/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useToastStore } from "@/src/presentation/components/toast"
import { ApiMetaLeadsRepository } from "@/src/infrastructure/crm/repositories/meta-leads/api-meta-leads.repository"
import type { MetaConfigUpdate, SimulateMetaLead } from "@crm/contracts"

export function useMetaStatus() {
  return useQuery({
    queryKey: ["meta", "status"],
    queryFn: async () => ApiMetaLeadsRepository.getStatus(),
  })
}

export function useMetaOAuthUrl(redirectUri?: string) {
  return useQuery({
    queryKey: ["meta", "oauth-url", redirectUri],
    queryFn: async () => ApiMetaLeadsRepository.getOAuthUrl(redirectUri),
    enabled: false,
  })
}

export function useMetaCallback() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (code: string) => ApiMetaLeadsRepository.handleCallback(code),
    onSuccess: () => {
      useToastStore.getState().addToast("¡Meta Business Suite conectado exitosamente!", "success")
      qc.invalidateQueries({ queryKey: ["meta"] })
    },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Error al conectar con Meta", "error"),
  })
}

export function useMetaUpdateConfig() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (dto: MetaConfigUpdate) => ApiMetaLeadsRepository.updateConfig(dto),
    onSuccess: () => {
      useToastStore.getState().addToast("Configuración de Meta Ads guardada", "success")
      qc.invalidateQueries({ queryKey: ["meta"] })
    },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Error al guardar", "error"),
  })
}

export function useMetaSyncForms() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => ApiMetaLeadsRepository.syncForms(),
    onSuccess: () => {
      useToastStore.getState().addToast("Formularios de Meta sincronizados", "success")
      qc.invalidateQueries({ queryKey: ["meta"] })
    },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Error al sincronizar", "error"),
  })
}

export function useMetaDisconnect() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => ApiMetaLeadsRepository.disconnect(),
    onSuccess: () => {
      useToastStore.getState().addToast("Meta Business desconectado", "info")
      qc.invalidateQueries({ queryKey: ["meta"] })
    },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Error al desconectar", "error"),
  })
}

export function useMetaLogs() {
  return useQuery({
    queryKey: ["meta", "logs"],
    queryFn: async () => ApiMetaLeadsRepository.listLogs(),
    refetchInterval: 10_000,
  })
}

export function useSimulateMetaLead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (dto: SimulateMetaLead) => ApiMetaLeadsRepository.simulateLead(dto),
    onSuccess: () => {
      useToastStore.getState().addToast("Lead de Meta recibido y procesado en el CRM", "success")
      qc.invalidateQueries({ queryKey: ["meta"] })
      qc.invalidateQueries({ queryKey: ["contacts"] })
      qc.invalidateQueries({ queryKey: ["deals"] })
    },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Error al simular lead", "error"),
  })
}

export function useFetchMetaPages() {
  return useMutation({
    mutationFn: async (accessToken: string) => ApiMetaLeadsRepository.fetchPages(accessToken),
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Error al consultar páginas de Meta", "error"),
  })
}

export function useConnectMetaAccount() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (dto: Parameters<typeof ApiMetaLeadsRepository.connectAccount>[0]) => ApiMetaLeadsRepository.connectAccount(dto),
    onSuccess: () => {
      useToastStore.getState().addToast("Página de Facebook conectada exitosamente", "success")
      qc.invalidateQueries({ queryKey: ["meta"] })
    },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Error al conectar página", "error"),
  })
}
