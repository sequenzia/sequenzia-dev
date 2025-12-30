'use client';

import { memo } from 'react';
import { FormContent } from './FormContent';
import { ChartContent } from './ChartContent';
import { CodeContent } from './CodeContent';
import { CardContent } from './CardContent';
import type { ExpandableContent as ExpandableContentType, ExpansionState } from '@/types';

interface ExpandableContentProps {
  content: ExpandableContentType;
  expansionState: ExpansionState;
  messageId: string;
}

export const ExpandableContent = memo(function ExpandableContent({
  content,
  expansionState,
  messageId,
}: ExpandableContentProps) {
  // Determine display mode based on expansion state
  const displayMode: 'preview' | 'partial' | 'full' =
    expansionState === 'collapsed'
      ? 'preview'
      : expansionState === 'partial'
      ? 'partial'
      : 'full';

  switch (content.type) {
    case 'form':
      return (
        <FormContent
          content={content}
          displayMode={displayMode}
          messageId={messageId}
        />
      );
    case 'chart':
      return (
        <ChartContent
          content={content}
          displayMode={displayMode}
          messageId={messageId}
        />
      );
    case 'code':
      return (
        <CodeContent
          content={content}
          displayMode={displayMode}
          messageId={messageId}
        />
      );
    case 'card':
      return (
        <CardContent
          content={content}
          displayMode={displayMode}
          messageId={messageId}
        />
      );
    default:
      return null;
  }
});
