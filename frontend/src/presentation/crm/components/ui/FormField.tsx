"use client"

import { type ReactNode } from "react"
import { type FieldError, type UseFormRegisterReturn } from "react-hook-form"
import { Input } from "./Input"
import { Select } from "./Select"

export interface FormFieldWrapperProps {
  label: string
  error?: FieldError
  required?: boolean
  children: ReactNode
}

export type FormFieldProps = FormFieldWrapperProps

export function FormFieldWrapper({ label, error, required, children }: FormFieldWrapperProps) {
  return (
    <div className="space-y-2">
      <label className="text-caption text-ash font-medium">
        {label}
        {required && <span className="text-[#f87171] ml-1">*</span>}
      </label>
      {children}
      {error && <p className="text-caption text-[#f87171]">{error.message}</p>}
    </div>
  )
}

export const FormField = FormFieldWrapper

interface FormInputProps {
  label: string
  registration: UseFormRegisterReturn
  error?: FieldError
  required?: boolean
  type?: string
  placeholder?: string
}

export function FormInput({ label, registration, error, required, type, placeholder }: FormInputProps) {
  return (
    <FormFieldWrapper label={label} error={error} required={required}>
      <Input type={type} placeholder={placeholder} {...registration} />
    </FormFieldWrapper>
  )
}

interface FormSelectProps {
  label: string
  registration: UseFormRegisterReturn
  error?: FieldError
  required?: boolean
  children: ReactNode
}

export function FormSelect({ label, registration, error, required, children }: FormSelectProps) {
  return (
    <FormFieldWrapper label={label} error={error} required={required}>
      <Select {...registration}>
        {children}
      </Select>
    </FormFieldWrapper>
  )
}
