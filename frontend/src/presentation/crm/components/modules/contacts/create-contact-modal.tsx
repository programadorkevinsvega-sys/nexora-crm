"use client"

import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/src/presentation/crm/components/ui/Button"
import { Modal } from "@/src/presentation/crm/components/ui/Modal"
import { FormInput } from "@/src/presentation/crm/components/ui/FormField"
import { useAuth } from "@/src/presentation/hooks/use-auth"
import { ApiContactRepository } from "@/src/infrastructure/crm/repositories/contacts/api-contact.repository"

const contactSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().max(100).optional().or(z.literal("")),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().max(50).optional().or(z.literal("")),
  jobTitle: z.string().max(200).optional().or(z.literal("")),
  
  // Advanced fields
  nickname: z.string().max(255).optional().or(z.literal("")),
  gender: z.string().max(50).optional().or(z.literal("")),
  birthDate: z.string().optional().or(z.literal("")),
  identificationType: z.string().max(50).optional().or(z.literal("")),
  identificationNumber: z.string().max(100).optional().or(z.literal("")),
  verificationDigit: z.string().max(5).optional().or(z.literal("")),
  taxRegime: z.string().max(100).optional().or(z.literal("")),
  isTaxLiable: z.boolean().optional(),
  
  streetAddress: z.string().max(255).optional().or(z.literal("")),
  city: z.string().max(255).optional().or(z.literal("")),
  stateProvince: z.string().max(255).optional().or(z.literal("")),
  postalCode: z.string().max(50).optional().or(z.literal("")),
  country: z.string().max(100).optional().or(z.literal("")),
  
  leadSource: z.string().max(100).optional().or(z.literal("")),
  leadStatus: z.string().max(50).optional(),
  stayInTouchFrequencyDays: z.string().optional().or(z.literal("")),
  loyaltyPoints: z.coerce.number().int().optional(),
})

type ContactFormData = z.infer<typeof contactSchema>

export interface CreateContactModalProps {
  onClose: () => void
  onSuccess: () => void
}

export function CreateContactModal({ onClose, onSuccess }: CreateContactModalProps) {
  const { tenantId } = useAuth()
  const [showAdvanced, setShowAdvanced] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      jobTitle: "",
      nickname: "",
      gender: "",
      birthDate: "",
      identificationType: "",
      identificationNumber: "",
      verificationDigit: "",
      taxRegime: "",
      isTaxLiable: false,
      streetAddress: "",
      city: "",
      stateProvince: "",
      postalCode: "",
      country: "",
      leadSource: "",
      leadStatus: "NEW",
      stayInTouchFrequencyDays: "",
      loyaltyPoints: 0,
    },
  })

  const mutation = useMutation({
    mutationFn: (data: ContactFormData) =>
      ApiContactRepository.create({
        tenantId: tenantId!,
        firstName: data.firstName,
        lastName: data.lastName || null,
        email: data.email || null,
        phone: data.phone || null,
        jobTitle: data.jobTitle || null,
        nickname: data.nickname || null,
        gender: data.gender || null,
        birthDate: data.birthDate || null,
        identificationType: data.identificationType || null,
        identificationNumber: data.identificationNumber || null,
        verificationDigit: data.verificationDigit || null,
        taxRegime: data.taxRegime || null,
        isTaxLiable: data.isTaxLiable || false,
        streetAddress: data.streetAddress || null,
        city: data.city || null,
        stateProvince: data.stateProvince || null,
        postalCode: data.postalCode || null,
        country: data.country || null,
        leadSource: data.leadSource || null,
        leadStatus: data.leadStatus || "NEW",
        stayInTouchFrequencyDays: data.stayInTouchFrequencyDays ? Number(data.stayInTouchFrequencyDays) : null,
        loyaltyPoints: data.loyaltyPoints !== undefined ? Number(data.loyaltyPoints) : 0,
      }),
    onSuccess,
  })

  return (
    <Modal open onClose={onClose} title="Create Contact">
      <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
        <div className="grid grid-cols-2 gap-4">
          <FormInput
            label="First Name"
            registration={register("firstName")}
            error={errors.firstName}
            required
            placeholder="John"
          />
          <FormInput
            label="Last Name"
            registration={register("lastName")}
            error={errors.lastName}
            placeholder="Doe"
          />
        </div>
        <FormInput
          label="Email"
          type="email"
          registration={register("email")}
          error={errors.email}
          placeholder="john@example.com"
        />
        <div className="grid grid-cols-2 gap-4">
          <FormInput
            label="Phone"
            registration={register("phone")}
            error={errors.phone}
            placeholder="+1 (555) 123-4567"
          />
          <FormInput
            label="Job Title"
            registration={register("jobTitle")}
            error={errors.jobTitle}
            placeholder="CEO"
          />
        </div>

        <div className="pt-2">
          <button
            type="button"
            className="text-caption font-medium text-primary hover:underline flex items-center gap-1"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            {showAdvanced ? "Hide Advanced Fields" : "Show Advanced Fields (ID, Tax, Address, CRM)"}
          </button>
        </div>

        {showAdvanced && (
          <div className="space-y-4 border-t border-muted/50 pt-4">
            <h4 className="text-caption font-semibold text-paper">Personal Details</h4>
            <div className="grid grid-cols-3 gap-4">
              <FormInput
                label="Nickname"
                registration={register("nickname")}
                error={errors.nickname}
                placeholder="Johnny"
              />
              <FormInput
                label="Gender"
                registration={register("gender")}
                error={errors.gender}
                placeholder="Male/Female"
              />
              <FormInput
                label="Birth Date"
                type="date"
                registration={register("birthDate")}
                error={errors.birthDate}
              />
            </div>

            <h4 className="text-caption font-semibold text-paper border-t border-muted/30 pt-3">Identification & Taxes</h4>
            <div className="grid grid-cols-3 gap-4">
              <FormInput
                label="ID Type"
                registration={register("identificationType")}
                error={errors.identificationType}
                placeholder="CC/NIT/PASSPORT"
              />
              <FormInput
                label="ID Number"
                registration={register("identificationNumber")}
                error={errors.identificationNumber}
                placeholder="12345678"
              />
              <FormInput
                label="Verification Digit"
                registration={register("verificationDigit")}
                error={errors.verificationDigit}
                placeholder="9"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="Tax Regime"
                registration={register("taxRegime")}
                error={errors.taxRegime}
                placeholder="Régimen Común"
              />
              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  id="isTaxLiable"
                  className="rounded border-muted text-primary focus:ring-primary"
                  {...register("isTaxLiable")}
                />
                <label htmlFor="isTaxLiable" className="text-caption font-medium text-ash">
                  Tax Liable (Responsable de IVA)
                </label>
              </div>
            </div>

            <h4 className="text-caption font-semibold text-paper border-t border-muted/30 pt-3">Address & Location</h4>
            <FormInput
              label="Street Address"
              registration={register("streetAddress")}
              error={errors.streetAddress}
              placeholder="123 Main St"
            />
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="City"
                registration={register("city")}
                error={errors.city}
                placeholder="Bogota"
              />
              <FormInput
                label="State / Province"
                registration={register("stateProvince")}
                error={errors.stateProvince}
                placeholder="Cundinamarca"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="Postal Code"
                registration={register("postalCode")}
                error={errors.postalCode}
                placeholder="110111"
              />
              <FormInput
                label="Country"
                registration={register("country")}
                error={errors.country}
                placeholder="Colombia"
              />
            </div>

            <h4 className="text-caption font-semibold text-paper border-t border-muted/30 pt-3">CRM & Sales Fields</h4>
            <div className="grid grid-cols-3 gap-4">
              <FormInput
                label="Lead Source"
                registration={register("leadSource")}
                error={errors.leadSource}
                placeholder="Web/Referral"
              />
              <FormInput
                label="Lead Status"
                registration={register("leadStatus")}
                error={errors.leadStatus}
                placeholder="NEW"
              />
              <FormInput
                label="Loyalty Points"
                type="number"
                registration={register("loyaltyPoints")}
                error={errors.loyaltyPoints}
                placeholder="0"
              />
            </div>
            <FormInput
              label="Stay In Touch Frequency (Days)"
              type="number"
              registration={register("stayInTouchFrequencyDays")}
              error={errors.stayInTouchFrequencyDays}
              placeholder="30"
            />
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-muted/50">
          <Button variant="ghost" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Creating..." : "Create"}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
