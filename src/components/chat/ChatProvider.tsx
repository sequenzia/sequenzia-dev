'use client';

import {
  createContext,
  useContext,
  useCallback,
  useMemo,
  useState,
} from 'react';
import { useChat as useAIChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import type { UIMessage, ChatStatus } from 'ai';
import { DEFAULT_MODEL_ID } from '@/lib/ai/models';

// Simplified chat context without expansion states
interface ChatContextValue {
  // Messages (raw AI SDK messages for direct use with AI Elements)
  messages: UIMessage[];
  status: ChatStatus;
  isLoading: boolean;
  error: Error | null;

  // Actions
  sendMessage: (content: string) => void;
  regenerateLastMessage: () => void;
  clearMessages: () => void;
  stop: () => void;

  // Model selection
  modelId: string;
  setModelId: (modelId: string) => void;
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined);

interface ChatProviderProps {
  children: React.ReactNode;
}

export function ChatProvider({ children }: ChatProviderProps) {
  // Model selection state
  const [modelId, setModelId] = useState<string>(DEFAULT_MODEL_ID);

  // AI chat hook with v6 API
  const {
    messages,
    status,
    error,
    sendMessage: aiSendMessage,
    stop,
    setMessages,
  } = useAIChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
    }),
  });

  // Derive isLoading from status
  const isLoading = status === 'submitted' || status === 'streaming';

  // Send a message
  const sendMessage = useCallback(
    (content: string) => {
      aiSendMessage({ text: content }, { body: { modelId } });
    },
    [aiSendMessage, modelId]
  );

  // Regenerate last assistant message
  const regenerateLastMessage = useCallback(() => {
    const lastUserMessageIndex = [...messages].reverse().findIndex(m => m.role === 'user');
    if (lastUserMessageIndex >= 0) {
      const index = messages.length - 1 - lastUserMessageIndex;
      const lastUserMessage = messages[index];
      const textPart = lastUserMessage.parts?.find(
        (p): p is { type: 'text'; text: string } => p.type === 'text'
      );
      if (textPart) {
        setMessages(messages.slice(0, index));
        setTimeout(() => {
          aiSendMessage({ text: textPart.text }, { body: { modelId } });
        }, 100);
      }
    }
  }, [messages, setMessages, aiSendMessage, modelId]);

  // Clear all messages
  const clearMessages = useCallback(() => {
    setMessages([]);
  }, [setMessages]);

  const contextValue: ChatContextValue = useMemo(
    () => ({
      messages,
      status,
      isLoading,
      error: error ?? null,
      sendMessage,
      regenerateLastMessage,
      clearMessages,
      stop,
      modelId,
      setModelId,
    }),
    [
      messages,
      status,
      isLoading,
      error,
      sendMessage,
      regenerateLastMessage,
      clearMessages,
      stop,
      modelId,
    ]
  );

  return (
    <ChatContext.Provider value={contextValue}>{children}</ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
