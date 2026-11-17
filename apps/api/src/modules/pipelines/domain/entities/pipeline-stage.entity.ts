export class PipelineStage {
  constructor(
    readonly id: string,
    readonly tenantId: string,
    readonly pipelineId: string,
    readonly name: string,
    readonly probabilityPercent: number,
    readonly displayOrder: number,
    readonly createdAt: Date,
  ) {}

  static create(props: {
    tenantId: string
    pipelineId: string
    name: string
    probabilityPercent?: number
    displayOrder: number
  }): PipelineStage {
    return new PipelineStage(
      crypto.randomUUID(),
      props.tenantId,
      props.pipelineId,
      props.name,
      props.probabilityPercent ?? 0,
      props.displayOrder,
      new Date(),
    )
  }
}
