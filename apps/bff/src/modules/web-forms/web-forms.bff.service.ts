import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { getDb, webForms, webFormSubmissions, contacts, tags, contactTags } from '@crm/database'
import { eq, and, desc, sql } from 'drizzle-orm'
import type { CreateWebForm, UpdateWebForm, WebForm, FormField } from '@crm/contracts'

@Injectable()
export class WebFormsBffService {
  private db = getDb()

  async list(tenantId: string): Promise<WebForm[]> {
    const list = await this.db
      .select()
      .from(webForms)
      .where(eq(webForms.tenantId, tenantId))
      .orderBy(desc(webForms.createdAt))

    return list as WebForm[]
  }

  async getById(id: string, tenantId: string): Promise<WebForm> {
    const form = await this.db.query.webForms?.findFirst?.({
      where: and(eq(webForms.id, id), eq(webForms.tenantId, tenantId)) as any,
    }) || (
      await this.db
        .select()
        .from(webForms)
        .where(and(eq(webForms.id, id), eq(webForms.tenantId, tenantId)))
        .limit(1)
    )[0]

    if (!form) throw new NotFoundException('Formulario no encontrado')
    return form as WebForm
  }

  async getPublicForm(idOrSlug: string): Promise<WebForm> {
    const list = await this.db
      .select()
      .from(webForms)
      .where(sql`${webForms.id}::text = ${idOrSlug} OR ${webForms.slug} = ${idOrSlug}`)
      .limit(1)

    const form = list[0]
    if (!form || !form.isActive) throw new NotFoundException('Formulario no disponible o inactivo')
    return form as WebForm
  }

  async create(dto: CreateWebForm, tenantId: string): Promise<WebForm> {
    const now = new Date()
    const id = crypto.randomUUID()
    const slug = dto.slug.toLowerCase().replace(/[^a-z0-9-_]/g, '-')

    const [inserted] = await this.db
      .insert(webForms)
      .values({
        id,
        tenantId,
        name: dto.name,
        slug,
        title: dto.title || 'Contáctanos',
        description: dto.description,
        fields: dto.fields || [],
        buttonText: dto.buttonText || 'Enviar Solicitud',
        successMessage: dto.successMessage || '¡Gracias! Hemos recibido tu información correctamente.',
        redirectUrl: dto.redirectUrl,
        leadSource: dto.leadSource || 'Formulario Web',
        defaultLeadStatus: dto.defaultLeadStatus || 'NEW',
        defaultTags: dto.defaultTags || [],
        assignToUserId: dto.assignToUserId,
        primaryColor: dto.primaryColor || '#06b6d4',
        backgroundColor: dto.backgroundColor || '#09090b',
        textColor: dto.textColor || '#f4f4f5',
        borderRadius: dto.borderRadius || '12px',
        customCss: dto.customCss,
        isActive: dto.isActive !== undefined ? dto.isActive : true,
        createdAt: now,
        updatedAt: now,
      })
      .returning()

    return inserted as WebForm
  }

  async update(id: string, dto: UpdateWebForm, tenantId: string): Promise<WebForm> {
    await this.getById(id, tenantId)
    const now = new Date()

    const [updated] = await this.db
      .update(webForms)
      .set({
        ...dto,
        slug: dto.slug ? dto.slug.toLowerCase().replace(/[^a-z0-9-_]/g, '-') : undefined,
        updatedAt: now,
      })
      .where(and(eq(webForms.id, id), eq(webForms.tenantId, tenantId)))
      .returning()

    return updated as WebForm
  }

  async delete(id: string, tenantId: string): Promise<void> {
    await this.getById(id, tenantId)
    await this.db.delete(webForms).where(and(eq(webForms.id, id), eq(webForms.tenantId, tenantId)))
  }

  async submitPublic(idOrSlug: string, formData: Record<string, any>, ip?: string, userAgent?: string) {
    const form = await this.getPublicForm(idOrSlug)
    const now = new Date()

    // 1. Extract contact fields from mapped formData
    const fields = (form.fields as FormField[]) || []
    const contactPayload: Record<string, any> = {
      tenantId: form.tenantId,
      leadSource: form.leadSource || 'Formulario Web',
      leadStatus: form.defaultLeadStatus || 'NEW',
      metadata: { formId: form.id, formSlug: form.slug, rawSubmission: formData },
    }

    for (const field of fields) {
      const val = formData[field.id] ?? formData[field.label]
      if (val !== undefined && val !== null) {
        if (field.mappedContactField === 'firstName') contactPayload.firstName = String(val)
        else if (field.mappedContactField === 'lastName') contactPayload.lastName = String(val)
        else if (field.mappedContactField === 'email') contactPayload.email = String(val).trim()
        else if (field.mappedContactField === 'phone') contactPayload.phone = String(val).trim()
        else if (field.mappedContactField === 'jobTitle') contactPayload.jobTitle = String(val)
        else if (field.mappedContactField === 'city') contactPayload.city = String(val)
        else if (field.mappedContactField === 'notes') contactPayload.metadata.notes = String(val)
      }
    }

    // Default first name if not captured
    if (!contactPayload.firstName) {
      contactPayload.firstName = contactPayload.email ? contactPayload.email.split('@')[0] : 'Lead Inbound'
    }

    // 2. Insert Contact into DB
    const contactId = crypto.randomUUID()
    await this.db.insert(contacts).values({
      id: contactId,
      tenantId: form.tenantId,
      firstName: contactPayload.firstName,
      lastName: contactPayload.lastName || null,
      email: contactPayload.email || null,
      phone: contactPayload.phone || null,
      jobTitle: contactPayload.jobTitle || null,
      city: contactPayload.city || null,
      leadSource: contactPayload.leadSource,
      leadStatus: contactPayload.leadStatus,
      metadata: contactPayload.metadata,
      createdAt: now,
      updatedAt: now,
    }).onConflictDoNothing()

    // 3. Record Submission
    const submissionId = crypto.randomUUID()
    await this.db.insert(webFormSubmissions).values({
      id: submissionId,
      tenantId: form.tenantId,
      formId: form.id,
      contactId,
      payloadJson: formData,
      ipAddress: ip || null,
      userAgent: userAgent || null,
      submittedAt: now,
    })

    // 4. Increment submissions counter
    await this.db
      .update(webForms)
      .set({ submissionsCount: sql`${webForms.submissionsCount} + 1` })
      .where(eq(webForms.id, form.id))

    return {
      success: true,
      message: form.successMessage,
      redirectUrl: form.redirectUrl || null,
      contactId,
    }
  }

  async listSubmissions(formId: string, tenantId: string) {
    await this.getById(formId, tenantId)
    return this.db
      .select()
      .from(webFormSubmissions)
      .where(and(eq(webFormSubmissions.formId, formId), eq(webFormSubmissions.tenantId, tenantId)))
      .orderBy(desc(webFormSubmissions.submittedAt))
  }
}
