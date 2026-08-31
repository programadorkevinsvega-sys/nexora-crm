"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/src/presentation/crm/components/ui/Button"
import { Input } from "@/src/presentation/crm/components/ui/Input"
import { Select } from "@/src/presentation/crm/components/ui/Select"
import { Card } from "@/src/presentation/crm/components/ui/Card"
import { PageHeader } from "@/src/presentation/crm/components/common/PageHeader"
import { Skeleton } from "@/src/presentation/crm/components/ui/Skeleton"
import { ErrorState } from "@/src/presentation/components/error-state"
import { useAuth } from "@/src/presentation/hooks/use-auth"
import { useContact, useUpdateContact } from "@src/application/crm/di/hooks"

export function EditContactPage() {
  const params = useParams()
  const router = useRouter()
  const { tenantId } = useAuth()
  const id = params.id as string

  const { data: contact, isLoading, isError, error } = useContact(id)

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [jobTitle, setJobTitle] = useState("")
  
  const [nickname, setNickname] = useState("")
  const [gender, setGender] = useState("")
  const [birthDate, setBirthDate] = useState("")
  const [identificationType, setIdentificationType] = useState("")
  const [identificationNumber, setIdentificationNumber] = useState("")
  const [verificationDigit, setVerificationDigit] = useState("")
  const [taxRegime, setTaxRegime] = useState("")
  const [isTaxLiable, setIsTaxLiable] = useState(false)
  const [streetAddress, setStreetAddress] = useState("")
  const [city, setCity] = useState("")
  const [stateProvince, setStateProvince] = useState("")
  const [postalCode, setPostalCode] = useState("")
  const [country, setCountry] = useState("")
  const [leadSource, setLeadSource] = useState("")
  const [leadStatus, setLeadStatus] = useState("NEW")
  const [stayInTouchFrequencyDays, setStayInTouchFrequencyDays] = useState("")
  const [loyaltyPoints, setLoyaltyPoints] = useState("")
  
  // Status Flags and Last Talked To
  const [isStarred, setIsStarred] = useState(false)
  const [isDeceased, setIsDeceased] = useState(false)
  const [lastTalkedToAt, setLastTalkedToAt] = useState("")

  useEffect(() => {
    if (contact) {
      setFirstName(contact.firstName)
      setLastName(contact.lastName ?? "")
      setEmail(contact.email ?? "")
      setPhone(contact.phone ?? "")
      setJobTitle(contact.jobTitle ?? "")
      setNickname(contact.nickname ?? "")
      setGender(contact.gender ?? "")
      setBirthDate(contact.birthDate ?? "")
      setIdentificationType(contact.identificationType ?? "")
      setIdentificationNumber(contact.identificationNumber ?? "")
      setVerificationDigit(contact.verificationDigit ?? "")
      setTaxRegime(contact.taxRegime ?? "")
      setIsTaxLiable(contact.isTaxLiable)
      setStreetAddress(contact.streetAddress ?? "")
      setCity(contact.city ?? "")
      setStateProvince(contact.stateProvince ?? "")
      setPostalCode(contact.postalCode ?? "")
      setCountry(contact.country ?? "")
      setLeadSource(contact.leadSource ?? "")
      setLeadStatus(contact.leadStatus)
      setStayInTouchFrequencyDays(contact.stayInTouchFrequencyDays ? String(contact.stayInTouchFrequencyDays) : "")
      setLoyaltyPoints(contact.loyaltyPoints !== undefined ? String(contact.loyaltyPoints) : "0")
      setIsStarred(contact.isStarred ?? false)
      setIsDeceased(contact.isDeceased ?? false)
      setLastTalkedToAt(contact.lastTalkedToAt ? contact.lastTalkedToAt.split('T')[0] : "")
    }
  }, [contact])

  const { mutate: updateContact, isPending } = useUpdateContact()

  if (isError) return <ErrorState message={error?.message} />
  if (isLoading) return <Skeleton className="h-96" />
  if (!contact) return <div className="text-body text-ash">Contact not found</div>

  const handleSave = () => {
    updateContact(
      {
        id,
        data: {
          firstName,
          lastName: lastName || null,
          email: email || null,
          phone: phone || null,
          jobTitle: jobTitle || null,
          nickname: nickname || null,
          gender: gender || null,
          birthDate: birthDate || null,
          identificationType: identificationType || null,
          identificationNumber: identificationNumber || null,
          verificationDigit: verificationDigit || null,
          taxRegime: taxRegime || null,
          isTaxLiable,
          streetAddress: streetAddress || null,
          city: city || null,
          stateProvince: stateProvince || null,
          postalCode: postalCode || null,
          country: country || null,
          leadSource: leadSource || null,
          leadStatus,
          stayInTouchFrequencyDays: stayInTouchFrequencyDays ? Number(stayInTouchFrequencyDays) : null,
          loyaltyPoints: loyaltyPoints ? Number(loyaltyPoints) : 0,
          isStarred,
          isDeceased,
          lastTalkedToAt: lastTalkedToAt ? new Date(lastTalkedToAt).toISOString() : null,
        },
      },
      {
        onSuccess: () => router.push(`/contacts/${id}`),
      }
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title="Edit Contact"
        breadcrumb={[
          { label: "Contacts", href: "/contacts" },
          { label: `${contact.firstName} ${contact.lastName ?? ""}`, href: `/contacts/${id}` },
          { label: "Edit" },
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 space-y-4">
          <h3 className="text-body font-sans font-semibold text-paper border-b border-muted/30 pb-2">Personal & Contact Info</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-caption text-ash font-medium">First Name *</label>
              <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First Name" />
            </div>
            <div className="space-y-2">
              <label className="text-caption text-ash font-medium">Last Name</label>
              <Input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last Name" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-caption text-ash font-medium">Email</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-caption text-ash font-medium">Phone</label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1..." />
            </div>
            <div className="space-y-2">
              <label className="text-caption text-ash font-medium">Job Title</label>
              <Input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="Job Title" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-caption text-ash font-medium">Nickname</label>
              <Input value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="Nickname" />
            </div>
            <div className="space-y-2">
              <label className="text-caption text-ash font-medium">Gender</label>
              <Input value={gender} onChange={(e) => setGender(e.target.value)} placeholder="Gender" />
            </div>
            <div className="space-y-2">
              <label className="text-caption text-ash font-medium">Birth Date</label>
              <Input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
            </div>
          </div>

          <div className="flex gap-6 pt-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isStarred"
                checked={isStarred}
                onChange={(e) => setIsStarred(e.target.checked)}
                className="rounded border-steel bg-graphite text-signal-blue"
              />
              <label htmlFor="isStarred" className="text-body text-paper">Starred (Destacado)</label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isDeceased"
                checked={isDeceased}
                onChange={(e) => setIsDeceased(e.target.checked)}
                className="rounded border-steel bg-graphite text-signal-blue"
              />
              <label htmlFor="isDeceased" className="text-body text-paper">Deceased (Fallecido)</label>
            </div>
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h3 className="text-body font-sans font-semibold text-paper border-b border-muted/30 pb-2">Identification & Taxes</h3>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-caption text-ash font-medium">ID Type</label>
              <Input value={identificationType} onChange={(e) => setIdentificationType(e.target.value)} placeholder="CC/NIT" />
            </div>
            <div className="space-y-2 col-span-2">
              <label className="text-caption text-ash font-medium">ID Number</label>
              <div className="flex gap-2">
                <Input className="flex-1" value={identificationNumber} onChange={(e) => setIdentificationNumber(e.target.value)} placeholder="ID Number" />
                <Input className="w-12 text-center" value={verificationDigit} onChange={(e) => setVerificationDigit(e.target.value)} placeholder="DV" maxLength={1} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-caption text-ash font-medium">Tax Regime</label>
              <Input value={taxRegime} onChange={(e) => setTaxRegime(e.target.value)} placeholder="Régimen Común" />
            </div>
            <div className="flex items-center gap-2 pt-8">
              <input
                type="checkbox"
                id="isTaxLiable"
                checked={isTaxLiable}
                onChange={(e) => setIsTaxLiable(e.target.checked)}
                className="rounded border-steel bg-graphite text-signal-blue"
              />
              <label htmlFor="isTaxLiable" className="text-body text-paper">Tax Liable (Responsable de IVA)</label>
            </div>
          </div>
        </Card>

        <Card className="p-6 space-y-4 md:col-span-2">
          <h3 className="text-body font-sans font-semibold text-paper border-b border-muted/30 pb-2">Address Details</h3>
          <div className="space-y-2">
            <label className="text-caption text-ash font-medium">Street Address</label>
            <Input value={streetAddress} onChange={(e) => setStreetAddress(e.target.value)} placeholder="123 Main St" />
          </div>
          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-caption text-ash font-medium">City</label>
              <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" />
            </div>
            <div className="space-y-2">
              <label className="text-caption text-ash font-medium">State / Province</label>
              <Input value={stateProvince} onChange={(e) => setStateProvince(e.target.value)} placeholder="State" />
            </div>
            <div className="space-y-2">
              <label className="text-caption text-ash font-medium">Postal Code</label>
              <Input value={postalCode} onChange={(e) => setPostalCode(e.target.value)} placeholder="Postal Code" />
            </div>
            <div className="space-y-2">
              <label className="text-caption text-ash font-medium">Country</label>
              <Input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Country" />
            </div>
          </div>
        </Card>

        <Card className="p-6 space-y-4 md:col-span-2">
          <h3 className="text-body font-sans font-semibold text-paper border-b border-muted/30 pb-2">CRM & Sales Details</h3>
          <div className="grid grid-cols-5 gap-4">
            <div className="space-y-2 col-span-1">
              <label className="text-caption text-ash font-medium">Lead Source</label>
              <Input value={leadSource} onChange={(e) => setLeadSource(e.target.value)} placeholder="Web/Referral" />
            </div>
            <div className="space-y-2 col-span-1">
              <label className="text-caption text-ash font-medium">Lead Status</label>
              <Select value={leadStatus} onChange={(e) => setLeadStatus(e.target.value)}>
                <option value="NEW">New</option>
                <option value="CONTACTED">Contacted</option>
                <option value="QUALIFIED">Qualified</option>
                <option value="CUSTOMER">Customer</option>
                <option value="CHURNED">Churned</option>
              </Select>
            </div>
            <div className="space-y-2 col-span-1">
              <label className="text-caption text-ash font-medium">Loyalty Points</label>
              <Input type="number" value={loyaltyPoints} onChange={(e) => setLoyaltyPoints(e.target.value)} placeholder="0" />
            </div>
            <div className="space-y-2 col-span-1">
              <label className="text-caption text-ash font-medium">Stay in Touch (Days)</label>
              <Input type="number" value={stayInTouchFrequencyDays} onChange={(e) => setStayInTouchFrequencyDays(e.target.value)} placeholder="30" />
            </div>
            <div className="space-y-2 col-span-1">
              <label className="text-caption text-ash font-medium">Last Talked To</label>
              <Input type="date" value={lastTalkedToAt} onChange={(e) => setLastTalkedToAt(e.target.value)} />
            </div>
          </div>
        </Card>
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="ghost" onClick={() => router.back()}>Cancel</Button>
        <Button onClick={handleSave} disabled={!firstName || isPending}>
          {isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  )
}
export default EditContactPage
