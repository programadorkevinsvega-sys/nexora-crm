import { Module } from '@nestjs/common'
import { PaymentsBffController } from './payments.bff.controller'
import { PaymentsBffService } from './payments.bff.service'
import { StripeDispatcher } from '../integrations/dispatchers/stripe.dispatcher'

@Module({
  controllers: [PaymentsBffController],
  providers: [PaymentsBffService, StripeDispatcher],
  exports: [PaymentsBffService],
})
export class PaymentsBffModule {}
