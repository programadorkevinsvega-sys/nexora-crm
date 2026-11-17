import { Module } from '@nestjs/common'
import { ContactsGrpcController } from './infrastructure/grpc/server/ContactsGrpcController'
import { ContactsHttpController } from './infrastructure/http/controllers/ContactsHttpController'
import { CreateContactUseCase } from './application/use-cases/CreateContactUseCase'
import { UpdateContactUseCase } from './application/use-cases/UpdateContactUseCase'
import { DeleteContactUseCase } from './application/use-cases/DeleteContactUseCase'
import { GetContactUseCase } from './application/use-cases/GetContactUseCase'
import { ListContactsUseCase } from './application/use-cases/ListContactsUseCase'
import { ContactRepositoryPort, CONTACT_REPOSITORY_TOKEN } from './application/ports/out/IContactRepositoryPort'
import { DrizzleContactRepository } from './infrastructure/persistence/drizzle/repositories/DrizzleContactRepository'
import { EVENT_PUBLISHER_TOKEN, IEventPublisherPort } from './application/ports/out/IEventPublisherPort'
import { ContactOutboxPublisher } from './infrastructure/messaging/nats/publishers/ContactOutboxPublisher'
import { OutboxService } from '../../common/outbox/outbox.service'

@Module({
  controllers: [ContactsHttpController, ContactsGrpcController],
  providers: [
    OutboxService,
    { provide: CONTACT_REPOSITORY_TOKEN, useClass: DrizzleContactRepository },
    { provide: ContactRepositoryPort, useClass: DrizzleContactRepository },
    { provide: EVENT_PUBLISHER_TOKEN, useClass: ContactOutboxPublisher },
    {
      provide: CreateContactUseCase,
      useFactory: (repo: ContactRepositoryPort, pub: IEventPublisherPort) =>
        new CreateContactUseCase(repo, pub),
      inject: [ContactRepositoryPort, EVENT_PUBLISHER_TOKEN],
    },
    {
      provide: UpdateContactUseCase,
      useFactory: (repo: ContactRepositoryPort, pub: IEventPublisherPort) =>
        new UpdateContactUseCase(repo, pub),
      inject: [ContactRepositoryPort, EVENT_PUBLISHER_TOKEN],
    },
    {
      provide: DeleteContactUseCase,
      useFactory: (repo: ContactRepositoryPort, pub: IEventPublisherPort) =>
        new DeleteContactUseCase(repo, pub),
      inject: [ContactRepositoryPort, EVENT_PUBLISHER_TOKEN],
    },
    {
      provide: GetContactUseCase,
      useFactory: (repo: ContactRepositoryPort) => new GetContactUseCase(repo),
      inject: [ContactRepositoryPort],
    },
    {
      provide: ListContactsUseCase,
      useFactory: (repo: ContactRepositoryPort) => new ListContactsUseCase(repo),
      inject: [ContactRepositoryPort],
    },
  ],
  exports: [
    ContactRepositoryPort,
    CreateContactUseCase,
    UpdateContactUseCase,
    DeleteContactUseCase,
    GetContactUseCase,
    ListContactsUseCase,
  ],
})
export class ContactsModule {}
