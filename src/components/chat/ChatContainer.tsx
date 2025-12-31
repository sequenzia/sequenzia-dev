'use client';

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

interface ChatContainerProps {
  className?: string;
}

export function ChatContainer({ className }: ChatContainerProps) {
  const { messages, status } = useChat();

  return (
    <Conversation className={cn('flex-1', className)}>
      <ConversationContent className="max-w-3xl mx-auto px-4 py-6">
        {messages.length === 0 ? (
          <ConversationEmptyState
            icon={<MessageSquare className="size-12" />}
            title="Start a conversation"
            description="Ask me anything. I can also create interactive forms, charts, code snippets, and more."
          />
        ) : (
          messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))
        )}

        {/* Loading indicator */}
        {status === 'submitted' && (
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Loader size={16} />
            <span>Thinking...</span>
          </div>
        )}
      </ConversationContent>
      <ConversationScrollButton />
    </Conversation>
  );
}
