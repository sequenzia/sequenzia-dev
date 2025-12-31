'use client';

import { memo } from 'react';
import { motion } from 'motion/react';
import type { UIMessage, ToolUIPart } from 'ai';
import { CopyIcon, RefreshCcwIcon, CheckIcon } from 'lucide-react';
import { useState, useCallback } from 'react';
import {
  Message,
  MessageContent,
  MessageResponse,
  MessageActions,
  MessageAction,
} from '@/components/ai-elements/message';
import {
  Tool,
  ToolHeader,
  ToolContent,
  ToolOutput,
} from '@/components/ai-elements/tool';
import { useChat } from './ChatProvider';
import { ExpandableContent } from '@/components/expandable/ExpandableContent';
import {
  messageItemUser,
  messageItemAssistant,
  useAnimationConfig,
  springs,
} from '@/lib/motion';
import type { ExpandableContent as ExpandableContentType } from '@/types';

interface ChatMessageProps {
  message: UIMessage;
}

export const ChatMessage = memo(function ChatMessage({ message }: ChatMessageProps) {
  const { regenerateLastMessage } = useChat();
  const [copied, setCopied] = useState(false);
  const { shouldAnimate, hoverGesture, tapGesture } = useAnimationConfig();

  const handleCopy = useCallback(async () => {
    // Get text content from message parts
    const textContent = message.parts
      ?.filter((p): p is { type: 'text'; text: string } => p.type === 'text')
      .map((p) => p.text)
      .join('') || '';

    await navigator.clipboard.writeText(textContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [message.parts]);

  // Choose animation variant based on role
  const messageVariants =
    message.role === 'user' ? messageItemUser : messageItemAssistant;

  return (
    <motion.div
      initial={shouldAnimate ? 'hidden' : false}
      animate={shouldAnimate ? 'visible' : false}
      variants={messageVariants}
    >
      <Message from={message.role}>
      <MessageContent>
        {message.parts?.map((part, index) => {
          // Handle text parts
          if (part.type === 'text') {
            const textPart = part as { type: 'text'; text: string };
            return (
              <MessageResponse key={`text-${index}`}>
                {textPart.text}
              </MessageResponse>
            );
          }

          // Handle tool parts (tool-generateForm, tool-generateChart, etc.)
          if (part.type.startsWith('tool-')) {
            const toolPart = part as unknown as ToolUIPart;
            const toolName = part.type.replace('tool-', '');

            // Check if this is one of our expandable content tools
            const isExpandableContent = [
              'generateForm',
              'generateChart',
              'generateCode',
              'generateCard',
            ].includes(toolName);

            if (isExpandableContent && toolPart.state === 'output-available' && toolPart.output) {
              // Render our custom expandable content
              const content = toolPart.output as ExpandableContentType;
              return (
                <div key={`tool-${index}`} className="mt-2">
                  <ExpandableContent
                    content={content}
                    messageId={message.id}
                  />
                </div>
              );
            }

            // For other tools or pending states, show the Tool component
            return (
              <Tool key={`tool-${index}`}>
                <ToolHeader
                  type={part.type as ToolUIPart['type']}
                  state={toolPart.state}
                  title={formatToolName(toolName)}
                />
                <ToolContent>
                  <ToolOutput
                    output={toolPart.output}
                    errorText={toolPart.errorText}
                  />
                </ToolContent>
              </Tool>
            );
          }

          return null;
        })}
      </MessageContent>

      {/* Actions for assistant messages with gesture feedback */}
      {message.role === 'assistant' && (
        <MessageActions>
          <motion.div
            whileHover={hoverGesture}
            whileTap={tapGesture}
            transition={springs.snappy}
          >
            <MessageAction
              tooltip="Copy"
              onClick={handleCopy}
            >
              {copied ? (
                <CheckIcon className="size-3.5" />
              ) : (
                <CopyIcon className="size-3.5" />
              )}
            </MessageAction>
          </motion.div>
          <motion.div
            whileHover={hoverGesture}
            whileTap={tapGesture}
            transition={springs.snappy}
          >
            <MessageAction
              tooltip="Regenerate"
              onClick={regenerateLastMessage}
            >
              <RefreshCcwIcon className="size-3.5" />
            </MessageAction>
          </motion.div>
        </MessageActions>
      )}
      </Message>
    </motion.div>
  );
});

// Helper to format tool names for display
function formatToolName(name: string): string {
  // Convert camelCase to Title Case with spaces
  return name
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}
