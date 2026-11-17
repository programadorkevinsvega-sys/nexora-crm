export class GetWorkflowQuery {
  constructor(readonly tenantId: string, readonly id: string) {}
}

export class ListWorkflowsQuery {
  constructor(readonly tenantId: string, readonly status?: string) {}
}

export class GetWorkflowExecutionQuery {
  constructor(readonly tenantId: string, readonly executionId: string) {}
}

export class ListWorkflowExecutionsQuery {
  constructor(
    readonly tenantId: string,
    readonly filters?: { workflowId?: string; status?: string },
  ) {}
}
