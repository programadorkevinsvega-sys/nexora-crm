import { Injectable, NotFoundException } from '@nestjs/common'
import {
  CreateCategoryCommand,
  CreateArticleCommand,
  VoteArticleCommand,
} from './kb.commands'
import { KnowledgeBaseRepository } from '../../domain/repositories/knowledge-base.repository'
import { KbCategory } from '../../domain/entities/kb-category.entity'
import { KbArticle } from '../../domain/entities/kb-article.entity'

@Injectable()
export class CreateCategoryHandler {
  constructor(private readonly repo: KnowledgeBaseRepository) {}

  async execute(command: CreateCategoryCommand): Promise<KbCategory> {
    const category = KbCategory.create({
      tenantId: command.tenantId,
      name: command.name,
      slug: command.slug,
      description: command.description,
      icon: command.icon,
      sortOrder: command.sortOrder,
      isPublic: command.isPublic,
    })
    return this.repo.createCategory(command.tenantId, category)
  }
}

@Injectable()
export class CreateArticleHandler {
  constructor(private readonly repo: KnowledgeBaseRepository) {}

  async execute(command: CreateArticleCommand): Promise<KbArticle> {
    const article = KbArticle.create({
      tenantId: command.tenantId,
      categoryId: command.categoryId,
      title: command.title,
      slug: command.slug,
      summary: command.summary,
      contentMarkdown: command.contentMarkdown,
      isPublished: command.isPublished,
      tags: command.tags,
      authorName: command.authorName,
    })
    return this.repo.createArticle(command.tenantId, article)
  }
}

@Injectable()
export class VoteArticleHandler {
  constructor(private readonly repo: KnowledgeBaseRepository) {}

  async execute(command: VoteArticleCommand): Promise<KbArticle> {
    const article = await this.repo.voteArticle(
      command.tenantId,
      command.articleId,
      command.isHelpful,
    )
    if (!article) {
      throw new NotFoundException(`Article with id ${command.articleId} not found`)
    }
    return article
  }
}
