import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { getDb, biReports, deals, contacts, supportTickets } from '@crm/database'
import { eq, and, desc } from 'drizzle-orm'
import { BiDataFeedHelper } from './bi-data-feed.helper'
import { BiReportSchema, type BiReport, type CreateBiReportDto } from '@crm/contracts'

@Injectable()
export class BiBffService {
  private readonly logger = new Logger(BiBffService.name)
  private get db() {
    return getDb()
  }

  async listReports(tenantId: string): Promise<BiReport[]> {
    let rows = await this.db.select().from(biReports)
      .where(eq(biReports.tenantId, tenantId))
      .orderBy(desc(biReports.createdAt))

    if (rows.length === 0) {
      await this.seedDefaultReports(tenantId)
      rows = await this.db.select().from(biReports)
        .where(eq(biReports.tenantId, tenantId))
        .orderBy(desc(biReports.createdAt))
    }
    return rows.map((row) => this.mapReport(row))
  }

  async createReport(tenantId: string, dto: CreateBiReportDto): Promise<BiReport> {
    const [created] = await this.db.insert(biReports).values({
      tenantId,
      title: dto.title,
      description: dto.description || null,
      category: dto.category,
      embedType: dto.embedType,
      embedUrl: dto.embedUrl,
      reportId: dto.reportId || null,
      workspaceId: dto.workspaceId || null,
      refreshSchedule: dto.refreshSchedule || 'HOURLY',
      isDefault: dto.isDefault || false,
    }).returning()

    this.logger.log(`Created BI report: ${created.id} (${created.title})`)
    return this.mapReport(created)
  }

  async deleteReport(tenantId: string, id: string): Promise<void> {
    const deleted = await this.db.delete(biReports)
      .where(and(eq(biReports.id, id), eq(biReports.tenantId, tenantId)))
      .returning()
    if (deleted.length === 0) throw new NotFoundException(`Reporte BI no encontrado: ${id}`)
  }

  async getDataFeed(tenantId: string, entity: string): Promise<import('./bi-data-feed.helper').BiFeedRow[]> {
    switch (entity.toLowerCase()) {
      case 'deals': {
        const rows = await this.db.select().from(deals).where(eq(deals.tenantId, tenantId))
        return BiDataFeedHelper.formatDealsFeed(rows)
      }
      case 'contacts': {
        const rows = await this.db.select().from(contacts).where(eq(contacts.tenantId, tenantId))
        return BiDataFeedHelper.formatContactsFeed(rows)
      }
      case 'tickets': {
        const rows = await this.db.select().from(supportTickets).where(eq(supportTickets.tenantId, tenantId))
        return BiDataFeedHelper.formatTicketsFeed(rows)
      }
      default:
        return []
    }
  }

  private async seedDefaultReports(tenantId: string) {
    await this.db.insert(biReports).values([
      {
        tenantId,
        title: 'Executive Sales & Revenue Velocity 360°',
        description: 'Dashboard integral de ingresos recurrentes, conversión por etapa y proyección de cierre.',
        category: 'EXECUTIVE',
        embedType: 'POWER_BI_WEB',
        embedUrl: 'https://app.powerbi.com/view?r=eyJrIjoiOGQxZjI3Y2EtZGYwMi00YmU0LWJjN2YtZDg1NTYwZGIwN2RiIiwidCI6IjY2MjBlMWVkLWFiY2QtNDc2OC05NDdiLWZmZTg4NWRlMDUyNCJ9',
        refreshSchedule: 'REALTIME',
        isDefault: true,
      },
      {
        tenantId,
        title: 'Customer Health, Churn & Retention Matrix',
        description: 'Análisis multidimensional de salud de clientes B2B, alertas tempranas y cohortes de retención.',
        category: 'SUPPORT',
        embedType: 'POWER_BI_WEB',
        embedUrl: 'https://app.powerbi.com/view?r=eyJrIjoiMmE0MjhkYTMtMzE3Mi00NWU5LTg0NmYtZjQ2YWEyN2ViNmU2IiwidCI6IjY2MjBlMWVkLWFiY2QtNDc2OC05NDdiLWZmZTg4NWRlMDUyNCJ9',
        refreshSchedule: 'HOURLY',
        isDefault: false,
      },
      {
        tenantId,
        title: 'Marketing ROI, Lead Acquisition & AI SDR Funnel',
        description: 'Rendimiento de canales omnicanal (WhatsApp, TikTok, Meta Ads) y efectividad de calificación BANT.',
        category: 'MARKETING',
        embedType: 'POWER_BI_WEB',
        embedUrl: 'https://app.powerbi.com/view?r=eyJrIjoiNGE2MzM5YTctZjY1YS00OWJkLThjOWEtZTUxNWVkYzQ5MTRkIiwidCI6IjY2MjBlMWVkLWFiY2QtNDc2OC05NDdiLWZmZTg4NWRlMDUyNCJ9',
        refreshSchedule: 'HOURLY',
        isDefault: false,
      },
    ])
  }

  private mapReport(row: typeof biReports.$inferSelect): BiReport {
    return BiReportSchema.parse({
      ...row,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    })
  }
}