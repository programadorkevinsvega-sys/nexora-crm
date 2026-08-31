"use client"

import { useState, useEffect } from "react"
import { CheckCircle2, XCircle, AlertTriangle, ShieldAlert, Check, X } from "lucide-react"
import { Button } from "@/src/presentation/crm/components/ui/Button"
import { Card } from "@/src/presentation/crm/components/ui/Card"
import { PageHeader } from "@/src/presentation/crm/components/common/PageHeader"
import { Badge } from "@/src/presentation/crm/components/ui/Badge"
import { Skeleton } from "@/src/presentation/crm/components/ui/Skeleton"
import { ApiCpqRepository } from "@/src/infrastructure/crm/repositories/cpq/api-cpq.repository"
import type { QuoteApproval } from "@/src/domain/crm/cpq/cpq.entity"

export function ApprovalsPage() {
  const [approvals, setApprovals] = useState<QuoteApproval[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)

  const fetchApprovals = async () => {
    try {
      setLoading(true)
      const list = await ApiCpqRepository.listPendingApprovals()
      setApprovals(list)
    } catch (err: any) {
      console.error("Failed to load approvals:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchApprovals()
  }, [])

  const handleDecision = async (id: string, status: "APPROVED" | "REJECTED") => {
    try {
      setProcessingId(id)
      const reason = status === "REJECTED" ? prompt("Please enter a rejection reason:") || "Rejected by Manager" : undefined
      await ApiCpqRepository.decideApproval(id, { status, rejectionReason: reason })
      await fetchApprovals()
    } catch (err: any) {
      alert(`Decision failed: ${err?.message}`)
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <PageHeader
        title="CPQ Margin & Discount Approvals"
        description="Governance rules: quotes with discounts >20% require Sales Manager authorization"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4 border-l-4 border-l-amber-500 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-muted-foreground uppercase">Pending Approvals</div>
            <div className="text-2xl font-bold text-foreground mt-1">{approvals.length} Quotes</div>
            <div className="text-xs text-amber-500 font-medium mt-1">Awaiting managerial sign-off</div>
          </div>
          <AlertTriangle className="h-8 w-8 text-amber-500 opacity-80" />
        </Card>

        <Card className="p-4 border-l-4 border-l-primary flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-muted-foreground uppercase">Governance Policy</div>
            <div className="text-sm font-semibold text-foreground mt-1">Max Sales Rep Autonomy: 20%</div>
            <div className="text-xs text-muted-foreground mt-1">Discounts &gt; 20% trigger lock on send</div>
          </div>
          <ShieldAlert className="h-8 w-8 text-primary opacity-80" />
        </Card>
      </div>

      {loading ? (
        <Skeleton className="h-64" />
      ) : approvals.length === 0 ? (
        <Card className="p-12 text-center space-y-3">
          <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
          <div className="font-semibold">All quotes approved</div>
          <div className="text-xs text-muted-foreground">No pending discount authorization requests at this time.</div>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead className="bg-muted/50 border-b font-medium text-muted-foreground">
              <tr>
                <th className="p-3">Approval ID</th>
                <th className="p-3">Quote Ref</th>
                <th className="p-3">Requested Discount</th>
                <th className="p-3">Status</th>
                <th className="p-3">Requested Date</th>
                <th className="p-3 text-right">Decision Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {approvals.map((a) => (
                <tr key={a.id} className="hover:bg-muted/30">
                  <td className="p-3 font-mono">{a.id.slice(0, 8)}...</td>
                  <td className="p-3 font-mono font-semibold text-primary">{a.quoteId.slice(0, 8)}...</td>
                  <td className="p-3">
                    <Badge variant="destructive" className="font-mono text-xs">
                      {a.requestedDiscountPercent}% OFF
                    </Badge>
                  </td>
                  <td className="p-3">
                    <Badge variant="secondary">{a.status}</Badge>
                  </td>
                  <td className="p-3 text-muted-foreground">
                    {new Date(a.createdAt).toLocaleString()}
                  </td>
                  <td className="p-3 text-right space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-emerald-600 border-emerald-500 hover:bg-emerald-50"
                      disabled={processingId === a.id}
                      onClick={() => handleDecision(a.id, "APPROVED")}
                    >
                      <Check className="h-3.5 w-3.5 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={processingId === a.id}
                      onClick={() => handleDecision(a.id, "REJECTED")}
                    >
                      <X className="h-3.5 w-3.5 mr-1" />
                      Reject
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  )
}
