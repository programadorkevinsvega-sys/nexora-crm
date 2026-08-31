"use client"

import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Pencil, Trash2, Star } from "lucide-react"
import { useState } from "react"
import { Button } from "@/src/presentation/crm/components/ui/Button"
import { Card } from "@/src/presentation/crm/components/ui/Card"
import { Tabs } from "@/src/presentation/crm/components/ui/Tabs"
import { PageHeader } from "@/src/presentation/crm/components/common/PageHeader"
import { EntityCard } from "@/src/presentation/crm/components/common/EntityCard"
import { Skeleton } from "@/src/presentation/crm/components/ui/Skeleton"
import { Avatar } from "@/src/presentation/crm/components/ui/Avatar"
import { ConfirmDialog } from "@/src/presentation/crm/components/common/ConfirmDialog"
import { ErrorState } from "@/src/presentation/components/error-state"
import { useAuth } from "@/src/presentation/hooks/use-auth"
import { useContact, useDeleteContact } from "@src/application/crm/di/hooks"
import { ClickToCallButton } from "@/src/presentation/crm/components/common/click-to-call-button"

export function ContactDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { tenantId } = useAuth()
  const [showDelete, setShowDelete] = useState(false)
  const [activeTab, setActiveTab] = useState("details")
  const id = params.id as string

  const { data: contact, isLoading, isError, error } = useContact(id)

  const { mutate: deleteContact } = useDeleteContact()

  if (isError) return <ErrorState message={error?.message} />
  if (isLoading) return <Skeleton className="h-96" />
  if (!contact) return <div className="text-body text-ash">Contact not found</div>

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${contact.firstName} ${contact.lastName}`}
        breadcrumb={[
          { label: "Contacts", href: "/contacts" },
          { label: `${contact.firstName} ${contact.lastName}` },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <ClickToCallButton
              phoneNumber={contact.phone}
              contactName={`${contact.firstName} ${contact.lastName || ""}`}
              contactId={id}
              showText
              size="sm"
            />
            <Button variant="outline" onClick={() => router.push(`/contacts/${id}/360`)}>
              <Star className="h-4 w-4 mr-1.5 text-amber-500 fill-amber-500" />
              Customer 360 Hub
            </Button>
            <Button variant="ghost" onClick={() => router.push(`/contacts/${id}/edit`)}>
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
            <Button variant="danger" onClick={() => setShowDelete(true)}>
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        }
      />

      <div className="flex items-center gap-4 mb-6">
        <Avatar name={`${contact.firstName} ${contact.lastName}`} size="lg" />
        <div>
          <p className="text-body text-ash">{contact.jobTitle ?? "No job title"}</p>
          <p className="text-caption text-ash">{contact.email}</p>
        </div>
      </div>

      <Tabs
        tabs={[
          { id: "details", label: "Details" },
          { id: "activity", label: "Activity" },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {activeTab === "details" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <EntityCard title="Contact Information">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-caption text-ash">First Name</p>
                  <p className="text-body text-paper">{contact.firstName}</p>
                </div>
                <div>
                  <p className="text-caption text-ash">Last Name</p>
                  <p className="text-body text-paper">{contact.lastName ?? "—"}</p>
                </div>
                <div>
                  <p className="text-caption text-ash">Nickname</p>
                  <p className="text-body text-paper">{contact.nickname ?? "—"}</p>
                </div>
                <div>
                  <p className="text-caption text-ash">Gender</p>
                  <p className="text-body text-paper">{contact.gender ?? "—"}</p>
                </div>
                <div>
                  <p className="text-caption text-ash">Email</p>
                  <p className="text-body text-paper">{contact.email ?? "—"}</p>
                </div>
                <div>
                  <p className="text-caption text-ash">Phone</p>
                  <p className="text-body text-paper">{contact.phone ?? "—"}</p>
                </div>
                <div>
                  <p className="text-caption text-ash">Birth Date</p>
                  <p className="text-body text-paper">{contact.birthDate ? new Date(contact.birthDate).toLocaleDateString() : "—"}</p>
                </div>
                <div>
                  <p className="text-caption text-ash">Status Flags</p>
                  <div className="flex gap-2 mt-1">
                    {contact.isStarred && <span className="text-caption px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-500 font-medium">Starred</span>}
                    {contact.isDeceased && <span className="text-caption px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 font-medium">Deceased</span>}
                    {!contact.isStarred && !contact.isDeceased && <span className="text-body text-paper">—</span>}
                  </div>
                </div>
              </div>
            </EntityCard>

            <EntityCard title="Identification & Tax Details">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-caption text-ash">Identification Type</p>
                  <p className="text-body text-paper">{contact.identificationType ?? "—"}</p>
                </div>
                <div>
                  <p className="text-caption text-ash">Identification Number</p>
                  <p className="text-body text-paper">{contact.identificationNumber ?? "—"}{contact.verificationDigit ? `-${contact.verificationDigit}` : ""}</p>
                </div>
                <div>
                  <p className="text-caption text-ash">Tax Regime</p>
                  <p className="text-body text-paper">{contact.taxRegime ?? "—"}</p>
                </div>
                <div>
                  <p className="text-caption text-ash">Tax Liable (Responsable de IVA)</p>
                  <p className="text-body text-paper">{contact.isTaxLiable ? "Yes" : "No"}</p>
                </div>
              </div>
            </EntityCard>

            <EntityCard title="Address & Location">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <p className="text-caption text-ash">Street Address</p>
                  <p className="text-body text-paper">{contact.streetAddress ?? "—"}</p>
                </div>
                <div>
                  <p className="text-caption text-ash">City</p>
                  <p className="text-body text-paper">{contact.city ?? "—"}</p>
                </div>
                <div>
                  <p className="text-caption text-ash">State / Province</p>
                  <p className="text-body text-paper">{contact.stateProvince ?? "—"}</p>
                </div>
                <div>
                  <p className="text-caption text-ash">Postal Code</p>
                  <p className="text-body text-paper">{contact.postalCode ?? "—"}</p>
                </div>
                <div>
                  <p className="text-caption text-ash">Country</p>
                  <p className="text-body text-paper">{contact.country ?? "—"}</p>
                </div>
              </div>
            </EntityCard>
          </div>

          <div className="space-y-6">
            <Card className="p-4">
              <h3 className="text-body font-sans font-semibold text-paper mb-4">CRM & Sales Info</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-caption text-ash font-medium">Job Title</p>
                  <p className="text-body text-paper font-semibold">{contact.jobTitle ?? "—"}</p>
                </div>
                <div>
                  <p className="text-caption text-ash font-medium">Lead Status</p>
                  <span className={`inline-block text-caption px-2 py-0.5 rounded-full font-medium mt-1 ${
                    contact.leadStatus === "CUSTOMER" ? "bg-green-500/10 text-green-500" :
                    contact.leadStatus === "QUALIFIED" ? "bg-blue-500/10 text-blue-500" :
                    contact.leadStatus === "CONTACTED" ? "bg-yellow-500/10 text-yellow-500" :
                    contact.leadStatus === "CHURNED" ? "bg-red-500/10 text-red-500" :
                    "bg-gray-500/10 text-gray-500"
                  }`}>
                    {contact.leadStatus}
                  </span>
                </div>
                <div>
                  <p className="text-caption text-ash font-medium">Lead Source</p>
                  <p className="text-body text-paper">{contact.leadSource ?? "—"}</p>
                </div>
                <div>
                  <p className="text-caption text-ash font-medium">Loyalty Points</p>
                  <p className="text-body text-paper font-semibold text-primary">{contact.loyaltyPoints} pts</p>
                </div>
                <div>
                  <p className="text-caption text-ash font-medium">Stay in Touch Frequency</p>
                  <p className="text-body text-paper">{contact.stayInTouchFrequencyDays ? `Every ${contact.stayInTouchFrequencyDays} days` : "Not set"}</p>
                </div>
                <div>
                  <p className="text-caption text-ash font-medium">Last Talked To</p>
                  <p className="text-body text-paper">{contact.lastTalkedToAt ? new Date(contact.lastTalkedToAt).toLocaleDateString() : "—"}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="text-body font-sans font-semibold text-paper mb-2">Metadata</h3>
              <div className="space-y-2 text-caption text-ash">
                <p>Created: {new Date(contact.createdAt).toLocaleDateString()}</p>
                <p>Updated: {new Date(contact.updatedAt).toLocaleDateString()}</p>
              </div>
            </Card>
          </div>
        </div>
      )}

      {activeTab === "activity" && (
        <Card className="p-4">
          <p className="text-body text-ash">Activity timeline coming soon</p>
        </Card>
      )}

      <ConfirmDialog
        open={showDelete}
        title="Delete contact"
        message={`Are you sure you want to delete "${contact.firstName} ${contact.lastName}"?`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => { deleteContact(id); router.push("/contacts") }}
        onCancel={() => setShowDelete(false)}
      />
    </div>
  )
}
export default ContactDetailPage
