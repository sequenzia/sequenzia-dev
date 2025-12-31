'use client';

import { useState, useCallback, useRef, useMemo } from 'react';
import { useChat } from './ChatProvider';
import { MODELS, getModelById } from '@/lib/ai/models';
import {
  PromptInput,
  PromptInputBody,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputTools,
  PromptInputSubmit,
  PromptInputButton,
  type PromptInputMessage,
} from '@/components/ai-elements/prompt-input';
import {
  ModelSelector,
  ModelSelectorContent,
  ModelSelectorEmpty,
  ModelSelectorGroup,
  ModelSelectorInput,
  ModelSelectorItem,
  ModelSelectorList,
  ModelSelectorLogo,
  ModelSelectorLogoGroup,
  ModelSelectorName,
  ModelSelectorTrigger,
} from '@/components/ai-elements/model-selector';
import { CheckIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InputComposerProps {
  className?: string;
}

export function InputComposer({ className }: InputComposerProps) {
  const { sendMessage, status, modelId, setModelId } = useChat();
  const [text, setText] = useState('');
  const [modelSelectorOpen, setModelSelectorOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const selectedModel = getModelById(modelId);

  // Get unique providers for grouping
  const providers = useMemo(() => {
    return Array.from(new Set(MODELS.map((model) => model.provider)));
  }, []);

  const handleSubmit = useCallback(
    (message: PromptInputMessage) => {
      const trimmedText = message.text?.trim();
      if (!trimmedText) return;

      sendMessage(trimmedText);
      setText('');
    },
    [sendMessage]
  );

  const handleModelSelect = useCallback(
    (id: string) => {
      setModelId(id);
      setModelSelectorOpen(false);
    },
    [setModelId]
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
              <ModelSelector
                open={modelSelectorOpen}
                onOpenChange={setModelSelectorOpen}
              >
                <ModelSelectorTrigger asChild>
                  <PromptInputButton className="gap-2">
                    {selectedModel?.providerSlug && (
                      <ModelSelectorLogo provider={selectedModel.providerSlug} />
                    )}
                    <ModelSelectorName>
                      {selectedModel?.name ?? 'Select model'}
                    </ModelSelectorName>
                  </PromptInputButton>
                </ModelSelectorTrigger>
                <ModelSelectorContent>
                  <ModelSelectorInput placeholder="Search models..." />
                  <ModelSelectorList>
                    <ModelSelectorEmpty>No models found.</ModelSelectorEmpty>
                    {providers.map((provider) => (
                      <ModelSelectorGroup key={provider} heading={provider}>
                        {MODELS.filter((model) => model.provider === provider).map(
                          (model) => (
                            <ModelSelectorItem
                              key={model.id}
                              value={model.id}
                              onSelect={() => handleModelSelect(model.id)}
                            >
                              <ModelSelectorLogo provider={model.providerSlug} />
                              <ModelSelectorName>{model.name}</ModelSelectorName>
                              {modelId === model.id ? (
                                <CheckIcon className="ml-auto size-4" />
                              ) : (
                                <div className="ml-auto size-4" />
                              )}
                            </ModelSelectorItem>
                          )
                        )}
                      </ModelSelectorGroup>
                    ))}
                  </ModelSelectorList>
                </ModelSelectorContent>
              </ModelSelector>
            </PromptInputTools>
            <PromptInputSubmit status={status} disabled={!text.trim()} />
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
