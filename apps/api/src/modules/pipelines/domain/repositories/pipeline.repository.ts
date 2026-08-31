import { Pipeline } from '../entities/pipeline.entity'

export abstract class PipelineRepository {
  abstract findById(tenantId: string, id: string): Promise<Pipeline | null>
  abstract findByTenantId(tenantId: string): Promise<Pipeline[]>
  abstract list(tenantId: string): Promise<Pipeline[]>
  abstract save(pipeline: Pipeline): Promise<void>
  abstract delete(tenantId: string, id: string): Promise<void>
}
