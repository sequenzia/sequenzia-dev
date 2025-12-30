'use client';

import { memo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FileText, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { useChat } from '@/components/chat/ChatProvider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { CardContentData } from '@/types';

interface CardContentProps {
  content: CardContentData;
  displayMode: 'preview' | 'partial' | 'full';
  messageId: string;
}

export const CardContent = memo(function CardContent({
  content,
  displayMode,
  messageId,
}: CardContentProps) {
  const { sendMessage } = useChat();

  const handleAction = useCallback(
    (action: string) => {
      sendMessage(`Clicked action: ${action}`);
    },
    [sendMessage]
  );

  // Preview mode - just show icon and title
  if (displayMode === 'preview') {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        {content.media ? (
          <ImageIcon className="w-4 h-4" />
        ) : (
          <FileText className="w-4 h-4" />
        )}
        <span className="text-sm">{content.title}</span>
        {content.media && (
          <Badge variant="secondary" className="text-xs">
            {content.media.type}
          </Badge>
        )}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={(e) => e.stopPropagation()}
      className={cn(
        'rounded-lg border border-border overflow-hidden',
        'bg-card'
      )}
    >
      {/* Media */}
      {content.media && displayMode === 'full' && (
        <div className="relative aspect-video bg-muted">
          {content.media.type === 'image' ? (
            <img
              src={content.media.url}
              alt={content.media.alt || content.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <video
              src={content.media.url}
              controls
              className="w-full h-full object-cover"
            />
          )}
        </div>
      )}

      {/* Thumbnail for partial mode */}
      {content.media && displayMode === 'partial' && (
        <div className="relative h-32 bg-muted flex items-center justify-center">
          {content.media.type === 'image' ? (
            <img
              src={content.media.url}
              alt={content.media.alt || content.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <ExternalLink className="w-8 h-8" />
              <span className="text-sm">Video</span>
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <div>
          <h4 className="font-semibold text-base">{content.title}</h4>
          {content.description && (
            <p className="text-sm text-muted-foreground mt-1">
              {content.description}
            </p>
          )}
        </div>

        {/* Body content (only in full mode) */}
        {content.content && displayMode === 'full' && (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <p className="whitespace-pre-wrap">{content.content}</p>
          </div>
        )}

        {/* Truncated content in partial mode */}
        {content.content && displayMode === 'partial' && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {content.content}
          </p>
        )}

        {/* Actions */}
        {content.actions && content.actions.length > 0 && displayMode === 'full' && (
          <div className="flex flex-wrap gap-2 pt-2">
            {content.actions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || 'default'}
                size="sm"
                onClick={() => handleAction(action.action)}
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
});
