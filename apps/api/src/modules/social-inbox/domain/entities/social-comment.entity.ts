export class SocialComment {
  constructor(
    readonly id: string,
    readonly tenantId: string,
    readonly platform: string,
    readonly postType: string,
    readonly postId: string,
    readonly postTitle: string | undefined,
    readonly authorId: string,
    readonly authorName: string,
    readonly authorAvatarUrl: string | undefined,
    readonly commentId: string,
    readonly parentCommentId: string | undefined,
    readonly message: string,
    readonly sentiment: string,
    readonly status: string,
    readonly replyMessage: string | undefined,
    readonly repliedAt: Date | undefined,
    readonly repliedBy: string | undefined,
    readonly createdAt: Date,
    readonly updatedAt: Date,
  ) {}

  static create(props: {
    tenantId: string
    platform: string
    postType: string
    postId: string
    postTitle?: string
    authorId: string
    authorName: string
    authorAvatarUrl?: string
    commentId: string
    parentCommentId?: string
    message: string
    sentiment?: string
    status?: string
    replyMessage?: string
    repliedAt?: Date
    repliedBy?: string
  }): SocialComment {
    const now = new Date()
    return new SocialComment(
      crypto.randomUUID(),
      props.tenantId,
      props.platform,
      props.postType,
      props.postId,
      props.postTitle,
      props.authorId,
      props.authorName,
      props.authorAvatarUrl,
      props.commentId,
      props.parentCommentId,
      props.message,
      props.sentiment || 'NEUTRAL',
      props.status || 'PENDING',
      props.replyMessage,
      props.repliedAt,
      props.repliedBy,
      now,
      now
    )
  }

  reply(replyMessage: string, repliedBy: string): SocialComment {
    const now = new Date()
    return new SocialComment(
      this.id,
      this.tenantId,
      this.platform,
      this.postType,
      this.postId,
      this.postTitle,
      this.authorId,
      this.authorName,
      this.authorAvatarUrl,
      this.commentId,
      this.parentCommentId,
      this.message,
      this.sentiment,
      'REPLIED',
      replyMessage,
      now,
      repliedBy,
      this.createdAt,
      now
    )
  }

  botReply(replyMessage: string, repliedBy: string, repliedAt: Date): SocialComment {
    return new SocialComment(
      this.id,
      this.tenantId,
      this.platform,
      this.postType,
      this.postId,
      this.postTitle,
      this.authorId,
      this.authorName,
      this.authorAvatarUrl,
      this.commentId,
      this.parentCommentId,
      this.message,
      this.sentiment,
      'BOT_REPLIED',
      replyMessage,
      repliedAt,
      repliedBy,
      this.createdAt,
      new Date()
    )
  }
}
