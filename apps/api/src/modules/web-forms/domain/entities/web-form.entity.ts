export interface FormField {
  id: string
  label: string
  type: 'text' | 'email' | 'phone' | 'textarea' | 'select' | 'checkbox' | 'number'
  placeholder?: string
  required?: boolean
  options?: string[]
  mappedContactField?: 'firstName' | 'lastName' | 'email' | 'phone' | 'jobTitle' | 'city' | 'notes'
}

export class WebForm {
  constructor(
    readonly id: string,
    readonly tenantId: string,
    readonly name: string,
    readonly slug: string,
    readonly title: string,
    readonly description: string | null,
    readonly fields: FormField[],
    readonly buttonText: string,
    readonly successMessage: string,
    readonly redirectUrl: string | null,
    readonly leadSource: string,
    readonly defaultLeadStatus: string,
    readonly defaultTags: string[],
    readonly assignToUserId: string | null,
    readonly primaryColor: string,
    readonly backgroundColor: string,
    readonly textColor: string,
    readonly borderRadius: string,
    readonly customCss: string | null,
    readonly submissionsCount: number,
    readonly isActive: boolean,
    readonly createdAt: Date,
    readonly updatedAt: Date,
  ) {}

  static create(props: {
    tenantId: string
    name: string
    slug: string
    title?: string
    description?: string | null
    fields?: FormField[]
    buttonText?: string
    successMessage?: string
    redirectUrl?: string | null
    leadSource?: string
    defaultLeadStatus?: string
    defaultTags?: string[]
    assignToUserId?: string | null
    primaryColor?: string
    backgroundColor?: string
    textColor?: string
    borderRadius?: string
    customCss?: string | null
    isActive?: boolean
  }): WebForm {
    const now = new Date()
    return new WebForm(
      crypto.randomUUID(),
      props.tenantId,
      props.name,
      props.slug,
      props.title || 'Contáctanos',
      props.description || null,
      props.fields || [],
      props.buttonText || 'Enviar Solicitud',
      props.successMessage || '¡Gracias! Hemos recibido tu información correctamente.',
      props.redirectUrl || null,
      props.leadSource || 'Formulario Web',
      props.defaultLeadStatus || 'NEW',
      props.defaultTags || [],
      props.assignToUserId || null,
      props.primaryColor || '#06b6d4',
      props.backgroundColor || '#09090b',
      props.textColor || '#f4f4f5',
      props.borderRadius || '12px',
      props.customCss || null,
      0,
      props.isActive !== undefined ? props.isActive : true,
      now,
      now,
    )
  }
}
