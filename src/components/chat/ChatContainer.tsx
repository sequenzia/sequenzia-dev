'use client';

import { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare } from 'lucide-react';
import { useChat } from './ChatProvider';
import { ChatMessage } from './ChatMessage';
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation';
import { Loader } from '@/components/ai-elements/loader';
import { cn } from '@/lib/utils';
import { fadeInUp } from '@/lib/motion';

interface ChatContainerProps {
  className?: string;
}

export function ChatContainer({ className }: ChatContainerProps) {
  const { messages, status } = useChat();

  // Helper to check if a message has visible content
  const messageHasContent = (message: typeof messages[number]) => {
    return message.parts?.some((part) => {
      if (part.type === 'text') {
        return (part as { type: 'text'; text: string }).text.length > 0;
      }
      // Tool parts are considered content
      if (part.type.startsWith('tool-')) {
        return true;
      }
      return false;
    });
  };

  // Filter out assistant messages that don't have content yet (during early streaming)
  const visibleMessages = useMemo(() => {
    return messages.filter((message) => {
      // Always show user messages
      if (message.role === 'user') return true;
      // Only show assistant messages that have content
      return messageHasContent(message);
    });
  }, [messages]);

  // Determine if we should show the loading indicator
  // Show during 'submitted' state AND during early 'streaming' before content arrives
  const showLoading = useMemo(() => {
    if (status === 'submitted') return true;
    if (status === 'streaming') {
      // Check if the last message is an assistant message with no content yet
      const lastMessage = messages[messages.length - 1];
      if (lastMessage?.role === 'assistant') {
        return !messageHasContent(lastMessage);
      }
    }
    return false;
  }, [status, messages]);

  return (
    <Conversation className={cn('flex-1', className)}>
      <ConversationContent className="max-w-3xl mx-auto px-4 py-6">
        {visibleMessages.length === 0 ? (
          <ConversationEmptyState
            icon={<MessageSquare className="size-12" />}
            title="Start a conversation"
            description="Ask me anything. I can also create interactive forms, charts, code snippets, and more."
          />
        ) : (
          visibleMessages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))
        )}

        {/* Loading indicator - shows until content starts streaming */}
        <AnimatePresence>
          {showLoading && (
            <motion.div
              key="loading"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={fadeInUp}
              className="flex items-center gap-2 text-muted-foreground text-sm"
            >
              <Loader size={16} />
              <span>Thinking...</span>
            </motion.div>
          )}
        </AnimatePresence>
      </ConversationContent>
      <ConversationScrollButton />
    </Conversation>
  );
}
