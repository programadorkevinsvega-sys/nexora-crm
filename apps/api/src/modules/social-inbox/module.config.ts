import { Module } from '@nestjs/common'
import { SocialInboxGrpcController } from './interfaces/grpc/social-inbox-grpc.controller'
import { DrizzleSocialInboxRepository } from './infrastructure/persistence/drizzle/drizzle-social-inbox.repository'
import { ListCommentsUseCase } from './application/use-cases/list-comments.use-case'
import { ReplyCommentUseCase } from './application/use-cases/reply-comment.use-case'
import { InsertCommentUseCase } from './application/use-cases/insert-comment.use-case'
import { UpdateCommentBotUseCase } from './application/use-cases/update-comment-bot.use-case'
import { ListRulesUseCase } from './application/use-cases/list-rules.use-case'
import { SaveRuleUseCase } from './application/use-cases/save-rule.use-case'
import { DeleteRuleUseCase } from './application/use-cases/delete-rule.use-case'
import { GetEnabledRulesForPlatformUseCase } from './application/use-cases/get-enabled-rules-for-platform.use-case'
import { AutoCreateContactUseCase } from './application/use-cases/auto-create-contact.use-case'

@Module({
  controllers: [SocialInboxGrpcController],
  providers: [
    {
      provide: 'SocialInboxRepository',
      useClass: DrizzleSocialInboxRepository,
    },
    ListCommentsUseCase,
    ReplyCommentUseCase,
    InsertCommentUseCase,
    UpdateCommentBotUseCase,
    ListRulesUseCase,
    SaveRuleUseCase,
    DeleteRuleUseCase,
    GetEnabledRulesForPlatformUseCase,
    AutoCreateContactUseCase,
  ],
})
export class SocialInboxModule {}
