'use client';

import { useRef, useEffect, useCallback } from 'react';
import { useChat } from './ChatProvider';
import { useScrollAnchor } from '@/hooks/useScrollAnchor';
import { MessageBubble } from './MessageBubble';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface ChatContainerProps {
  className?: string;
}

export function ChatContainer({ className }: ChatContainerProps) {
  const { messages, isLoading, focusedMessageId } = useChat();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollToBottom, isAtBottom } = useScrollAnchor({
    containerRef,
    enabled: true,
  });

  // Track if we were at bottom before new message
  const wasAtBottomRef = useRef(true);

  // Check scroll position on scroll
  const handleScroll = useCallback(() => {
    wasAtBottomRef.current = isAtBottom();
  }, [isAtBottom]);

  // Auto-scroll on new messages if we were at bottom
  useEffect(() => {
    if (wasAtBottomRef.current && messages.length > 0) {
      // Small delay to let content render
      requestAnimationFrame(() => {
        scrollToBottom(true);
      });
    }
  }, [messages.length, scrollToBottom]);

  // Scroll to bottom when loading starts (user sent message)
  useEffect(() => {
    if (isLoading) {
      scrollToBottom(true);
    }
  }, [isLoading, scrollToBottom]);

  return (
    <ScrollArea
      ref={containerRef}
      className={cn(
        'flex-1 overflow-y-auto',
        // Add overlay when a message is focused
        focusedMessageId && 'relative',
        className
      )}
      onScroll={handleScroll}
    >
      {/* Focus overlay */}
      {focusedMessageId && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-10 pointer-events-none"
          aria-hidden="true"
        />
      )}

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        {messages.length === 0 ? (
          <EmptyState />
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isFocusedGlobally={focusedMessageId === message.id}
            />
          ))
        )}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex items-center gap-2 text-muted-foreground text-sm pl-12">
            <LoadingDots />
            <span>Thinking...</span>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
        <svg
          className="w-8 h-8 text-primary"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      </div>
      <h2 className="text-xl font-semibold mb-2">Start a conversation</h2>
      <p className="text-muted-foreground max-w-sm">
        Ask me anything. I can also create interactive forms, charts, code
        snippets, and more.
      </p>
    </div>
  );
}

function LoadingDots() {
  return (
    <span className="flex gap-1">
      <span className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.3s]" />
      <span className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.15s]" />
      <span className="w-2 h-2 bg-current rounded-full animate-bounce" />
    </span>
  );
}
