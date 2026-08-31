export class ListApiKeysQuery {
  constructor(readonly tenantId: string) {}
}

export class ValidateApiKeyQuery {
  constructor(readonly rawKey: string) {}
}

export class ListWebhookEndpointsQuery {
  constructor(readonly tenantId: string) {}
}

export class ListDeliveryLogsQuery {
  constructor(
    readonly tenantId: string,
    readonly endpointId: string,
  ) {}
}
