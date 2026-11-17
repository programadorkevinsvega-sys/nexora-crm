export type BlockType = 'text' | 'image' | 'button' | 'spacer' | 'divider';

export interface EmailBlock {
  id: string;
  type: BlockType;
  content?: string;
  style?: Record<string, string | number>;
  url?: string;
  altText?: string;
}

export interface EmailTemplate {
  subject: string;
  body: {
    blocks: EmailBlock[];
    globalStyle?: Record<string, string | number>;
  };
}
