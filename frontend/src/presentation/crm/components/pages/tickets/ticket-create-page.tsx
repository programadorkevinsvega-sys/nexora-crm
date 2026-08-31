"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/src/presentation/crm/components/ui/Button"
import { Input } from "@/src/presentation/crm/components/ui/Input"
import { Select } from "@/src/presentation/crm/components/ui/Select"
import { Card } from "@/src/presentation/crm/components/ui/Card"
import { PageHeader } from "@/src/presentation/crm/components/common/PageHeader"
import { useAuth } from "@/src/presentation/hooks/use-auth"
import { useCreateTicket } from "@src/application/crm/di/hooks"

export function CreateTicketPage() {
  const router = useRouter()
  const { tenantId } = useAuth()

  const [subject, setSubject] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState("MEDIUM")

  const { mutate: createTicket, isPending } = useCreateTicket()

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader
        title="Create Ticket"
        breadcrumb={[
          { label: "Tickets", href: "/crm/tickets" },
          { label: "Create Ticket" },
        ]}
      />

      <Card className="p-6 space-y-4">
        <div className="space-y-2">
          <label className="text-caption text-ash font-medium">Subject *</label>
          <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Ticket subject" />
        </div>

        <div className="space-y-2">
          <label className="text-caption text-ash font-medium">Description *</label>
          <textarea
            className="h-32 w-full rounded-inputs bg-graphite px-3 py-2 text-sm text-foreground placeholder:text-ash rekki-inset focus:outline-none focus:ring-1 focus:ring-ring resize-none"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the issue..."
          />
        </div>

        <div className="space-y-2">
          <label className="text-caption text-ash font-medium">Priority</label>
          <Select value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </Select>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="ghost" onClick={() => router.back()}>Cancel</Button>
          <Button onClick={() => createTicket(
                { tenantId: tenantId!, subject, description, priority },
                { onSuccess: () => router.push("/tickets") }
              )} disabled={!subject || !description || isPending}>
            {isPending ? "Creating..." : "Create Ticket"}
          </Button>
        </div>
      </Card>
    </div>
  )
}
export default CreateTicketPage
