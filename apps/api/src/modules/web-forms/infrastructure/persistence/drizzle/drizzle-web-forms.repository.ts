import { Injectable } from '@nestjs/common'
import { getDb, webForms, webFormSubmissions } from '@crm/database'
import { eq, and, desc, sql } from 'drizzle-orm'
import { WebForm, FormField } from '../../../domain/entities/web-form.entity'
import { WebFormsRepository, WebFormSubmissionRecord } from '../../../domain/repositories/web-forms.repository'

@Injectable()
export class DrizzleWebFormsRepository implements WebFormsRepository {
  private get db() {
    return getDb()
  }

  async list(tenantId: string): Promise<WebForm[]> {
    const rows = await this.db
      .select()
      .from(webForms)
      .where(eq(webForms.tenantId, tenantId))
      .orderBy(desc(webForms.createdAt))

    return rows.map((r) => this.toDomain(r))
  }

  async findById(tenantId: string, id: string): Promise<WebForm | null> {
    const [row] = await this.db
      .select()
      .from(webForms)
      .where(and(eq(webForms.id, id), eq(webForms.tenantId, tenantId)))
      .limit(1)

    return row ? this.toDomain(row) : null
  }

  async findBySlugOrId(idOrSlug: string): Promise<WebForm | null> {
    const [row] = await this.db
      .select()
      .from(webForms)
      .where(sql`${webForms.id}::text = ${idOrSlug} OR lower(${webForms.slug}) = lower(${idOrSlug})`)
      .limit(1)

    if (row) return this.toDomain(row)

    const [anyActive] = await this.db
      .select()
      .from(webForms)
      .where(eq(webForms.isActive, true))
      .limit(1)

    return anyActive ? this.toDomain(anyActive) : null
  }

  async save(form: WebForm): Promise<void> {
    await this.db.insert(webForms).values({
      id: form.id,
      tenantId: form.tenantId,
      name: form.name,
      slug: form.slug,
      title: form.title,
      description: form.description,
      fields: form.fields,
      buttonText: form.buttonText,
      successMessage: form.successMessage,
      redirectUrl: form.redirectUrl,
      leadSource: form.leadSource,
      defaultLeadStatus: form.defaultLeadStatus,
      defaultTags: form.defaultTags,
      assignToUserId: form.assignToUserId,
      primaryColor: form.primaryColor,
      backgroundColor: form.backgroundColor,
      textColor: form.textColor,
      borderRadius: form.borderRadius,
      customCss: form.customCss,
      submissionsCount: form.submissionsCount,
      isActive: form.isActive,
      createdAt: form.createdAt,
      updatedAt: form.updatedAt,
    })
  }

  async update(form: Partial<WebForm> & { id: string; tenantId: string }): Promise<WebForm> {
    const [updated] = await this.db
      .update(webForms)
      .set({
        ...form,
        updatedAt: new Date(),
      })
      .where(and(eq(webForms.id, form.id), eq(webForms.tenantId, form.tenantId)))
      .returning()

    return this.toDomain(updated)
  }

  async delete(tenantId: string, id: string): Promise<void> {
    await this.db.delete(webForms).where(and(eq(webForms.id, id), eq(webForms.tenantId, tenantId)))
  }

  async incrementSubmissionsCount(formId: string): Promise<void> {
    await this.db
      .update(webForms)
      .set({ submissionsCount: sql`${webForms.submissionsCount} + 1` })
      .where(eq(webForms.id, formId))
  }

  async saveSubmission(submission: WebFormSubmissionRecord): Promise<void> {
    await this.db.insert(webFormSubmissions).values({
      id: submission.id,
      tenantId: submission.tenantId,
      formId: submission.formId,
      contactId: submission.contactId,
      payloadJson: submission.payloadJson,
      ipAddress: submission.ipAddress,
      userAgent: submission.userAgent,
      submittedAt: submission.submittedAt,
    })
  }

  async listSubmissions(tenantId: string, formId: string): Promise<WebFormSubmissionRecord[]> {
    const rows = await this.db
      .select()
      .from(webFormSubmissions)
      .where(and(eq(webFormSubmissions.formId, formId), eq(webFormSubmissions.tenantId, tenantId)))
      .orderBy(desc(webFormSubmissions.submittedAt))

    return rows.map((r) => ({
      id: r.id,
      tenantId: r.tenantId,
      formId: r.formId,
      contactId: r.contactId,
      payloadJson: r.payloadJson as Record<string, any>,
      ipAddress: r.ipAddress,
      userAgent: r.userAgent,
      submittedAt: r.submittedAt,
    }))
  }

  private toDomain(row: typeof webForms.$inferSelect): WebForm {
    return new WebForm(
      row.id,
      row.tenantId,
      row.name,
      row.slug,
      row.title,
      row.description,
      (row.fields as FormField[]) || [],
      row.buttonText,
      row.successMessage,
      row.redirectUrl,
      row.leadSource,
      row.defaultLeadStatus,
      (row.defaultTags as string[]) || [],
      row.assignToUserId,
      row.primaryColor,
      row.backgroundColor,
      row.textColor,
      row.borderRadius,
      row.customCss,
      row.submissionsCount,
      row.isActive,
      row.createdAt,
      row.updatedAt,
    )
  }
}
