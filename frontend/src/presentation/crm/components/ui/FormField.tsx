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
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-muted-foreground">
        {label}
        {required && <span className="text-rose-400 ml-1">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-rose-400 font-medium">{error.message}</p>}
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

export interface FormSelectOption {
  label: string
  value: string | number
}

interface FormSelectProps {
  label: string
  registration: UseFormRegisterReturn
  error?: FieldError
  required?: boolean
  options?: FormSelectOption[]
  children?: ReactNode
}

export function FormSelect({ label, registration, error, required, options, children }: FormSelectProps) {
  return (
    <FormFieldWrapper label={label} error={error} required={required}>
      <Select {...registration}>
        {options
          ? options.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-zinc-900 text-zinc-100 py-1">
                {opt.label}
              </option>
            ))
          : children}
      </Select>
    </FormFieldWrapper>
  )
}
