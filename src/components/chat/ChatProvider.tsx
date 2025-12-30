'use client';

import {
  createContext,
  useContext,
  useCallback,
  useMemo,
  useReducer,
  useEffect,
} from 'react';
import { useChat as useAIChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import type { Message, ExpansionState, ExpansionStateData, ExpandableContent } from '@/types';

// Action types for expansion state reducer
type ExpansionAction =
  | { type: 'SET_STATE'; messageId: string; state: ExpansionState }
  | { type: 'TOGGLE'; messageId: string }
  | { type: 'FOCUS'; messageId: string }
  | { type: 'UNFOCUS'; messageId: string }
  | { type: 'PIN'; messageId: string; pinned: boolean }
  | { type: 'INCREMENT_DEPTH'; messageId: string }
  | { type: 'COLLAPSE_ALL'; except?: string };

type ExpansionStateMap = Map<string, ExpansionStateData>;

function expansionReducer(
  state: ExpansionStateMap,
  action: ExpansionAction
): ExpansionStateMap {
  const newState = new Map(state);

  switch (action.type) {
    case 'SET_STATE': {
      const existing = newState.get(action.messageId);
      newState.set(action.messageId, {
        messageId: action.messageId,
        state: action.state,
        pinned: existing?.pinned ?? false,
        interactionDepth: existing?.interactionDepth ?? 0,
      });
      return newState;
    }

    case 'TOGGLE': {
      const existing = newState.get(action.messageId);
      const currentState = existing?.state ?? 'collapsed';

      // Cycle: collapsed -> partial -> expanded -> collapsed
      const nextState: ExpansionState =
        currentState === 'collapsed'
          ? 'partial'
          : currentState === 'partial'
          ? 'expanded'
          : currentState === 'expanded'
          ? 'collapsed'
          : 'collapsed'; // from focused

      newState.set(action.messageId, {
        messageId: action.messageId,
        state: nextState,
        pinned: existing?.pinned ?? false,
        interactionDepth: (existing?.interactionDepth ?? 0) + 1,
      });
      return newState;
    }

    case 'FOCUS': {
      const existing = newState.get(action.messageId);
      newState.set(action.messageId, {
        messageId: action.messageId,
        state: 'focused',
        pinned: true,
        interactionDepth: (existing?.interactionDepth ?? 0) + 1,
      });
      return newState;
    }

    case 'UNFOCUS': {
      const existing = newState.get(action.messageId);
      if (existing) {
        newState.set(action.messageId, {
          ...existing,
          state: 'expanded',
          pinned: false,
        });
      }
      return newState;
    }

    case 'PIN': {
      const existing = newState.get(action.messageId);
      if (existing) {
        newState.set(action.messageId, {
          ...existing,
          pinned: action.pinned,
        });
      }
      return newState;
    }

    case 'INCREMENT_DEPTH': {
      const existing = newState.get(action.messageId);
      if (existing) {
        newState.set(action.messageId, {
          ...existing,
          interactionDepth: existing.interactionDepth + 1,
        });
      }
      return newState;
    }

    case 'COLLAPSE_ALL': {
      newState.forEach((value, key) => {
        if (key !== action.except && !value.pinned) {
          newState.set(key, { ...value, state: 'collapsed' });
        }
      });
      return newState;
    }

    default:
      return state;
  }
}

// Chat context value interface
interface ChatContextValue {
  // Messages
  messages: Message[];
  isLoading: boolean;
  error: Error | null;

  // Actions
  sendMessage: (content: string) => void;
  regenerateLastMessage: () => void;
  clearMessages: () => void;
  stop: () => void;

  // Expansion state
  expansionStates: ExpansionStateMap;
  getExpansionState: (messageId: string) => ExpansionState;
  setExpansionState: (messageId: string, state: ExpansionState) => void;
  toggleExpansion: (messageId: string) => void;
  focusMessage: (messageId: string) => void;
  unfocusMessage: (messageId: string) => void;
  pinMessage: (messageId: string, pinned: boolean) => void;
  collapseAll: (except?: string) => void;

  // Focused message
  focusedMessageId: string | null;
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined);

interface ChatProviderProps {
  children: React.ReactNode;
}

export function ChatProvider({ children }: ChatProviderProps) {
  // Expansion state management
  const [expansionStates, dispatchExpansion] = useReducer(
    expansionReducer,
    new Map<string, ExpansionStateData>()
  );

  // AI chat hook with new v6 API
  const {
    messages: aiMessages,
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

  // Transform AI messages to our Message type
  const messages: Message[] = useMemo(() => {
    return aiMessages.map((m) => {
      // Extract text content from parts
      let textContent = '';
      const toolInvocations: Array<{
        id: string;
        toolName: string;
        args: Record<string, unknown>;
        state: 'result' | 'pending' | 'error';
        result?: unknown;
      }> = [];

      if (m.parts) {
        for (const part of m.parts) {
          if (part.type === 'text') {
            textContent += (part as { type: 'text'; text: string }).text;
          } else if (part.type.startsWith('tool-')) {
            // Handle tool parts
            const toolPart = part as {
              type: string;
              toolCallId: string;
              toolName?: string;
              input?: unknown;
              output?: unknown;
              state?: string;
            };
            toolInvocations.push({
              id: toolPart.toolCallId,
              toolName: toolPart.toolName || 'unknown',
              args: (toolPart.input as Record<string, unknown>) || {},
              state: toolPart.state === 'output' ? 'result' : 'pending',
              result: toolPart.output,
            });
          }
        }
      }

      return {
        id: m.id,
        role: m.role as 'user' | 'assistant',
        content: textContent,
        timestamp: new Date().toISOString(),
        expandableContent: parseExpandableContent(toolInvocations),
        toolInvocations: toolInvocations.length > 0 ? toolInvocations : undefined,
      };
    });
  }, [aiMessages]);

  // Send a message
  const sendMessage = useCallback(
    (content: string) => {
      aiSendMessage({ text: content });
    },
    [aiSendMessage]
  );

  // Regenerate last assistant message
  const regenerateLastMessage = useCallback(() => {
    // Remove the last assistant message and resend
    const lastUserMessageIndex = [...aiMessages].reverse().findIndex(m => m.role === 'user');
    if (lastUserMessageIndex >= 0) {
      const index = aiMessages.length - 1 - lastUserMessageIndex;
      const lastUserMessage = aiMessages[index];
      const textPart = lastUserMessage.parts?.find(
        (p): p is { type: 'text'; text: string } => p.type === 'text'
      );
      if (textPart) {
        setMessages(aiMessages.slice(0, index));
        setTimeout(() => {
          aiSendMessage({ text: textPart.text });
        }, 100);
      }
    }
  }, [aiMessages, setMessages, aiSendMessage]);

  // Clear all messages
  const clearMessages = useCallback(() => {
    setMessages([]);
  }, [setMessages]);

  // Expansion state helpers
  const getExpansionState = useCallback(
    (messageId: string): ExpansionState => {
      return expansionStates.get(messageId)?.state ?? 'collapsed';
    },
    [expansionStates]
  );

  const setExpansionState = useCallback(
    (messageId: string, state: ExpansionState) => {
      dispatchExpansion({ type: 'SET_STATE', messageId, state });
    },
    []
  );

  const toggleExpansion = useCallback((messageId: string) => {
    dispatchExpansion({ type: 'TOGGLE', messageId });
  }, []);

  const focusMessage = useCallback((messageId: string) => {
    dispatchExpansion({ type: 'FOCUS', messageId });
  }, []);

  const unfocusMessage = useCallback((messageId: string) => {
    dispatchExpansion({ type: 'UNFOCUS', messageId });
  }, []);

  const pinMessage = useCallback((messageId: string, pinned: boolean) => {
    dispatchExpansion({ type: 'PIN', messageId, pinned });
  }, []);

  const collapseAll = useCallback((except?: string) => {
    dispatchExpansion({ type: 'COLLAPSE_ALL', except });
  }, []);

  // Get currently focused message
  const focusedMessageId = useMemo(() => {
    for (const [id, data] of expansionStates) {
      if (data.state === 'focused') {
        return id;
      }
    }
    return null;
  }, [expansionStates]);

  // Auto-expand new assistant messages with expandable content
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (
      lastMessage?.role === 'assistant' &&
      lastMessage.expandableContent &&
      !expansionStates.has(lastMessage.id)
    ) {
      dispatchExpansion({
        type: 'SET_STATE',
        messageId: lastMessage.id,
        state: 'partial',
      });
    }
  }, [messages, expansionStates]);

  const contextValue: ChatContextValue = useMemo(
    () => ({
      messages,
      isLoading,
      error: error ?? null,
      sendMessage,
      regenerateLastMessage,
      clearMessages,
      stop,
      expansionStates,
      getExpansionState,
      setExpansionState,
      toggleExpansion,
      focusMessage,
      unfocusMessage,
      pinMessage,
      collapseAll,
      focusedMessageId,
    }),
    [
      messages,
      isLoading,
      error,
      sendMessage,
      regenerateLastMessage,
      clearMessages,
      stop,
      expansionStates,
      getExpansionState,
      setExpansionState,
      toggleExpansion,
      focusMessage,
      unfocusMessage,
      pinMessage,
      collapseAll,
      focusedMessageId,
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

// Helper to parse expandable content from tool invocations
function parseExpandableContent(
  toolInvocations?: Array<{ toolName: string; state: string; result?: unknown }>
): ExpandableContent | undefined {
  if (!toolInvocations) return undefined;

  for (const tool of toolInvocations) {
    if (tool.state === 'result' && tool.result) {
      const result = tool.result as { type?: string };
      if (
        result.type === 'form' ||
        result.type === 'chart' ||
        result.type === 'code' ||
        result.type === 'card'
      ) {
        return result as ExpandableContent;
      }
    }
  }

  return undefined;
}
