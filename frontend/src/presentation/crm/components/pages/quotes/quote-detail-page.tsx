"use client"

import { useParams, useRouter } from "next/navigation"
import { Trash2, Send, Check, X } from "lucide-react"
import { useState } from "react"
import { Button } from "@/src/presentation/crm/components/ui/Button"
import { Card } from "@/src/presentation/crm/components/ui/Card"
import { PageHeader } from "@/src/presentation/crm/components/common/PageHeader"
import { EntityCard } from "@/src/presentation/crm/components/common/EntityCard"
import { StatusBadge } from "@/src/presentation/crm/components/common/StatusBadge"
import { Skeleton } from "@/src/presentation/crm/components/ui/Skeleton"
import { ConfirmDialog } from "@/src/presentation/crm/components/common/ConfirmDialog"
import { ErrorState } from "@/src/presentation/components/error-state"
import { useAuth } from "@/src/presentation/hooks/use-auth"
import { useQuote, useAcceptQuote, useRejectQuote, useSendQuote, useDeleteQuote } from "@src/application/crm/di/hooks"

export function QuoteDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { tenantId } = useAuth()
  const [showDelete, setShowDelete] = useState(false)
  const id = params.id as string

  const { data: quote, isLoading, isError, error } = useQuote(id)

  const { mutate: deleteQuote } = useDeleteQuote()

  const { mutate: sendQuote } = useSendQuote()

  const { mutate: acceptQuote } = useAcceptQuote()

  const { mutate: rejectQuote } = useRejectQuote()

  if (isError) return <ErrorState message={error?.message} />
  if (isLoading) return <Skeleton className="h-96" />
  if (!quote) return <div className="text-body text-ash">Quote not found</div>

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Quote ${quote.quoteNumber}`}
        breadcrumb={[
          { label: "Quotes", href: "/quotes" },
          { label: quote.quoteNumber },
        ]}
        actions={
          <div className="flex gap-2">
            {quote.status === "DRAFT" && (
              <Button onClick={() => sendQuote(id)}>
                <Send className="h-4 w-4" />
                Send
              </Button>
            )}
            {quote.status === "SENT" && (
              <>
                <Button variant="ghost" onClick={() => acceptQuote(id)}>
                  <Check className="h-4 w-4" />
                  Accept
                </Button>
                <Button variant="ghost" onClick={() => rejectQuote({ id })}>
                  <X className="h-4 w-4" />
                  Reject
                </Button>
              </>
            )}
            <Button variant="danger" onClick={() => setShowDelete(true)}>
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <EntityCard title="Quote Information">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-caption text-ash">Status</p>
                <StatusBadge status={quote.status} />
              </div>
              <div>
                <p className="text-caption text-ash">Valid Until</p>
                <p className="text-body text-paper">{new Date(quote.validUntil).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-caption text-ash">Subtotal</p>
                <p className="text-body text-paper">{quote.subtotal != null ? `$${quote.subtotal.toLocaleString()}` : "—"}</p>
              </div>
              <div>
                <p className="text-caption text-ash">Tax</p>
                <p className="text-body text-paper">{quote.taxTotal != null ? `$${quote.taxTotal.toLocaleString()}` : "—"}</p>
              </div>
              <div>
                <p className="text-caption text-ash">Grand Total</p>
                <p className="text-body text-paper font-semibold">{quote.grandTotal != null ? `$${quote.grandTotal.toLocaleString()}` : "—"}</p>
              </div>
            </div>
          </EntityCard>

          {quote.termsAndConditions && (
            <EntityCard title="Terms & Conditions">
              <p className="text-body text-paper whitespace-pre-wrap">{quote.termsAndConditions}</p>
            </EntityCard>
          )}
        </div>

        <div className="space-y-4">
          <Card className="p-4">
            <h3 className="text-body font-sans font-semibold text-paper mb-2">Metadata</h3>
            <div className="space-y-2 text-caption text-ash">
              <p>Created: {new Date(quote.createdAt).toLocaleDateString()}</p>
              <p>Updated: {new Date(quote.updatedAt).toLocaleDateString()}</p>
            </div>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={showDelete}
        title="Delete quote"
        message={`Are you sure you want to delete quote "${quote.quoteNumber}"?`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => deleteQuote(id, { onSuccess: () => router.push("/quotes") })}
        onCancel={() => setShowDelete(false)}
      />
    </div>
  )
}
export default QuoteDetailPage
