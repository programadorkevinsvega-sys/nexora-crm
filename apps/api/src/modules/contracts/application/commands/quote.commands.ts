export class CreateQuoteCommand {
  constructor(
    readonly tenantId: string,
    readonly dealId: string | null | undefined,
    readonly quoteNumber: string,
    readonly validUntil: string,
    readonly termsAndConditions?: string | null,
    readonly subtotal?: number,
    readonly taxTotal?: number,
    readonly grandTotal?: number,
  ) {}
}

export class SendQuoteCommand {
  constructor(readonly tenantId: string, readonly id: string) {}
}

export class AcceptQuoteCommand {
  constructor(readonly tenantId: string, readonly id: string) {}
}

export class RejectQuoteCommand {
  constructor(readonly tenantId: string, readonly id: string, readonly reason: string) {}
}
