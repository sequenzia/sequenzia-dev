'use client';

import { useState, useCallback, useRef } from 'react';
import { useChat } from './ChatProvider';
import { MODELS } from '@/lib/ai/models';
import {
  PromptInput,
  PromptInputBody,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputTools,
  PromptInputSubmit,
  PromptInputSelect,
  PromptInputSelectContent,
  PromptInputSelectItem,
  PromptInputSelectTrigger,
  PromptInputSelectValue,
  type PromptInputMessage,
} from '@/components/ai-elements/prompt-input';
import { cn } from '@/lib/utils';

interface InputComposerProps {
  className?: string;
}

export function InputComposer({ className }: InputComposerProps) {
  const { sendMessage, status, modelId, setModelId } = useChat();
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = useCallback(
    (message: PromptInputMessage) => {
      const trimmedText = message.text?.trim();
      if (!trimmedText) return;

      sendMessage(trimmedText);
      setText('');
    },
    [sendMessage]
  );

  return (
    <div className={cn('border-t bg-background', className)}>
      <div className="max-w-3xl mx-auto px-4 py-4">
        <PromptInput onSubmit={handleSubmit}>
          <PromptInputBody>
            <PromptInputTextarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Message Sequenzia..."
              className="min-h-[44px]"
            />
          </PromptInputBody>
          <PromptInputFooter>
            <PromptInputTools>
              <PromptInputSelect
                value={modelId}
                onValueChange={setModelId}
              >
                <PromptInputSelectTrigger className="w-[180px]">
                  <PromptInputSelectValue />
                </PromptInputSelectTrigger>
                <PromptInputSelectContent>
                  {MODELS.map((model) => (
                    <PromptInputSelectItem key={model.id} value={model.id}>
                      {model.name}
                    </PromptInputSelectItem>
                  ))}
                </PromptInputSelectContent>
              </PromptInputSelect>
            </PromptInputTools>
            <PromptInputSubmit
              status={status}
              disabled={!text.trim()}
            />
          </PromptInputFooter>
        </PromptInput>

        {/* Hint text */}
        <p className="text-xs text-muted-foreground mt-2 text-center">
          <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono text-xs">
            Enter
          </kbd>{' '}
          to send,{' '}
          <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono text-xs">
            Shift
          </kbd>{' '}
          +{' '}
          <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono text-xs">
            Enter
          </kbd>{' '}
          for new line
        </p>
      </div>
    </div>
  );
}
