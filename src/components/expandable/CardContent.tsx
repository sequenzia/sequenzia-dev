'use client';

import { memo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useChat } from '@/components/chat/ChatProvider';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { CardContentData } from '@/types';

interface CardContentProps {
  content: CardContentData;
  messageId?: string;
}

export const CardContent = memo(function CardContent({
  content,
}: CardContentProps) {
  const { sendMessage } = useChat();

  const handleAction = useCallback(
    (action: string) => {
      sendMessage(`Clicked action: ${action}`);
    },
    [sendMessage]
  );

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
      {content.media && (
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

        {/* Body content */}
        {content.content && (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <p className="whitespace-pre-wrap">{content.content}</p>
          </div>
        )}

        {/* Actions */}
        {content.actions && content.actions.length > 0 && (
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
