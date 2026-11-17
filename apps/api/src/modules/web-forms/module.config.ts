import { Module } from '@nestjs/common'
import { WebFormsGrpcController } from './interfaces/grpc/web-forms-grpc.controller'
import { WebFormsRepository } from './domain/repositories/web-forms.repository'
import { DrizzleWebFormsRepository } from './infrastructure/persistence/drizzle/drizzle-web-forms.repository'
import { ListWebFormsUseCase } from './application/use-cases/list-web-forms.use-case'
import { GetWebFormUseCase } from './application/use-cases/get-web-form.use-case'
import { CreateWebFormUseCase } from './application/use-cases/create-web-form.use-case'
import { UpdateWebFormUseCase } from './application/use-cases/update-web-form.use-case'
import { DeleteWebFormUseCase } from './application/use-cases/delete-web-form.use-case'
import { SubmitWebFormUseCase } from './application/use-cases/submit-web-form.use-case'
import { ListSubmissionsUseCase } from './application/use-cases/list-submissions.use-case'

@Module({
  controllers: [WebFormsGrpcController],
  providers: [
    { provide: WebFormsRepository, useClass: DrizzleWebFormsRepository },
    ListWebFormsUseCase,
    GetWebFormUseCase,
    CreateWebFormUseCase,
    UpdateWebFormUseCase,
    DeleteWebFormUseCase,
    SubmitWebFormUseCase,
    ListSubmissionsUseCase,
  ],
  exports: [
    ListWebFormsUseCase,
    GetWebFormUseCase,
    CreateWebFormUseCase,
    UpdateWebFormUseCase,
    DeleteWebFormUseCase,
    SubmitWebFormUseCase,
    ListSubmissionsUseCase,
  ],
})
export class WebFormsModule {}
