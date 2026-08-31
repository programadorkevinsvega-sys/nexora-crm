export class DealLineItem {
  constructor(
    readonly id: string,
    readonly tenantId: string,
    readonly dealId: string,
    readonly productId: string,
    readonly productName: string,
    readonly quantity: number,
    readonly unitPrice: number,
    readonly discountPercent: number,
    readonly totalPrice: number,
  ) {}

  static create(props: {
    tenantId: string
    dealId: string
    productId: string
    productName: string
    quantity?: number
    unitPrice: number
    discountPercent?: number
    totalPrice: number
  }): DealLineItem {
    return new DealLineItem(
      crypto.randomUUID(),
      props.tenantId,
      props.dealId,
      props.productId,
      props.productName,
      props.quantity ?? 1,
      props.unitPrice,
      props.discountPercent ?? 0,
      props.totalPrice,
    )
  }
}
