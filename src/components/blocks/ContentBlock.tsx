'use client';

import { memo } from 'react';
import { FormContent } from './FormContent';
import { ChartContent } from './ChartContent';
import { CodeContent } from './CodeContent';
import { CardContent } from './CardContent';
import type { ContentBlock as ContentBlockType } from '@/types';

interface ContentBlockProps {
  content: ContentBlockType;
  messageId: string;
}

export const ContentBlock = memo(function ContentBlock({
  content,
  messageId,
}: ContentBlockProps) {
  switch (content.type) {
    case 'form':
      return <FormContent content={content} messageId={messageId} />;
    case 'chart':
      return <ChartContent content={content} messageId={messageId} />;
    case 'code':
      return <CodeContent content={content} messageId={messageId} />;
    case 'card':
      return <CardContent content={content} messageId={messageId} />;
    default:
      return null;
  }
});
