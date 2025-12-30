'use client';

import { memo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Copy, RotateCcw, Pin, PinOff, Maximize2, Minimize2 } from 'lucide-react';
import { useExpansion } from '@/hooks/useExpansion';
import { ExpandableContent } from '@/components/expandable/ExpandableContent';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { Message } from '@/types';

interface MessageBubbleProps {
  message: Message;
  isFocusedGlobally?: boolean;
}

export const MessageBubble = memo(function MessageBubble({
  message,
  isFocusedGlobally = false,
}: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const hasExpandableContent = !!message.expandableContent;

  const {
    state,
    isCollapsed,
    isPartial,
    isExpanded,
    isFocused,
    toggle,
    focus,
    unfocus,
    pin,
    unpin,
    handleKeyDown,
  } = useExpansion({
    messageId: message.id,
    hasExpandableContent,
  });

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(message.content);
  }, [message.content]);

  // Animation variants for the bubble
  const bubbleVariants = {
    collapsed: {
      scale: 1,
    },
    partial: {
      scale: 1,
    },
    expanded: {
      scale: 1,
    },
    focused: {
      scale: 1.02,
      zIndex: 20,
    },
  };

  return (
    <TooltipProvider>
      <motion.div
        data-message-id={message.id}
        className={cn(
          'group relative flex gap-3',
          isUser ? 'flex-row-reverse' : 'flex-row',
          isFocused && 'z-20 relative'
        )}
        variants={bubbleVariants}
        animate={state}
        transition={{
          duration: 0.25,
          ease: 'easeOut',
        }}
        role="article"
        aria-label={`${isUser ? 'Your' : 'Assistant'} message`}
        tabIndex={hasExpandableContent ? 0 : -1}
        onKeyDown={handleKeyDown}
      >
        {/* Avatar */}
        <Avatar className="w-8 h-8 shrink-0">
          <AvatarFallback
            className={cn(
              'text-xs font-medium',
              isUser
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            )}
          >
            {isUser ? 'U' : 'S'}
          </AvatarFallback>
        </Avatar>

        {/* Message content */}
        <div
          className={cn(
            'flex-1 min-w-0 max-w-[85%]',
            isUser && 'flex flex-col items-end'
          )}
        >
          {/* Bubble */}
          <motion.div
            className={cn(
              'rounded-2xl px-4 py-3 transition-colors',
              isUser
                ? 'bg-[var(--message-user)] text-foreground rounded-tr-sm'
                : 'bg-[var(--message-assistant)] text-foreground rounded-tl-sm border border-border',
              hasExpandableContent && 'cursor-pointer',
              isFocused && 'ring-2 ring-primary shadow-lg'
            )}
            onClick={hasExpandableContent ? toggle : undefined}
            layout
          >
            {/* Text content */}
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <p className="whitespace-pre-wrap break-words m-0">
                {message.content}
              </p>
            </div>

            {/* Expandable content */}
            {hasExpandableContent && message.expandableContent && (
              <AnimatePresence mode="wait">
                <motion.div
                  key={state}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{
                    opacity: 1,
                    height: 'auto',
                    transition: {
                      height: {
                        duration: 0.25,
                        ease: 'easeOut',
                      },
                      opacity: {
                        duration: 0.2,
                        delay: 0.05,
                      },
                    },
                  }}
                  exit={{
                    opacity: 0,
                    height: 0,
                    transition: {
                      opacity: {
                        duration: 0.15,
                      },
                      height: {
                        duration: 0.2,
                        delay: 0.1,
                      },
                    },
                  }}
                  className="overflow-hidden"
                >
                  {!isCollapsed && (
                    <div className="mt-3 pt-3 border-t border-border/50">
                      <ExpandableContent
                        content={message.expandableContent}
                        expansionState={state}
                        messageId={message.id}
                      />
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            )}
          </motion.div>

          {/* Expansion indicator & controls */}
          {hasExpandableContent && (
            <div className="flex items-center gap-1 mt-1 px-2">
              {/* Expand/collapse indicator */}
              <button
                onClick={toggle}
                className={cn(
                  'flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors',
                  'focus:outline-none focus:ring-2 focus:ring-ring rounded px-1'
                )}
                aria-label={isCollapsed ? 'Expand content' : 'Collapse content'}
              >
                {isCollapsed ? (
                  <>
                    <ChevronDown className="w-3 h-3" />
                    <span>Show {getContentTypeLabel(message.expandableContent?.type)}</span>
                  </>
                ) : (
                  <>
                    <ChevronUp className="w-3 h-3" />
                    <span>
                      {isExpanded || isFocused ? 'Collapse' : 'Expand'}
                    </span>
                  </>
                )}
              </button>

              {/* Focus button */}
              {(isPartial || isExpanded) && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-6 h-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        isFocused ? unfocus() : focus();
                      }}
                    >
                      {isFocused ? (
                        <Minimize2 className="w-3 h-3" />
                      ) : (
                        <Maximize2 className="w-3 h-3" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isFocused ? 'Exit focus mode' : 'Focus mode'}
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          )}

          {/* Action buttons (visible on hover) */}
          <div
            className={cn(
              'flex items-center gap-1 mt-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity',
              isUser && 'justify-end'
            )}
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-6 h-6"
                  onClick={handleCopy}
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Copy message</TooltipContent>
            </Tooltip>

            {!isUser && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="w-6 h-6">
                    <RotateCcw className="w-3 h-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Regenerate</TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
      </motion.div>
    </TooltipProvider>
  );
});

function getContentTypeLabel(type?: string): string {
  switch (type) {
    case 'form':
      return 'form';
    case 'chart':
      return 'chart';
    case 'code':
      return 'code';
    case 'card':
      return 'card';
    default:
      return 'content';
  }
}
