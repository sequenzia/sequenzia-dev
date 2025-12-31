'use client';

import { memo } from 'react';
import { FormContent } from './FormContent';
import { ChartContent } from './ChartContent';
import { CodeContent } from './CodeContent';
import { CardContent } from './CardContent';
import type { ExpandableContent as ExpandableContentType } from '@/types';

interface ExpandableContentProps {
  content: ExpandableContentType;
  messageId: string;
}

export const ExpandableContent = memo(function ExpandableContent({
  content,
  messageId,
}: ExpandableContentProps) {
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
