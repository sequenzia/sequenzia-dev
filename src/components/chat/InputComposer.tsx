'use client';

import { memo, useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Paperclip, X, Loader2 } from 'lucide-react';
import { useChat } from './ChatProvider';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface InputComposerProps {
  className?: string;
}

export const InputComposer = memo(function InputComposer({
  className,
}: InputComposerProps) {
  const { sendMessage, isLoading } = useChat();
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [message]);

  // Focus textarea on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleSubmit = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault();

      const trimmedMessage = message.trim();
      if (!trimmedMessage || isLoading) return;

      sendMessage(trimmedMessage);
      setMessage('');

      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    },
    [message, isLoading, sendMessage]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Submit on Enter (without Shift)
      // Shift+Enter allows multi-line input
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  const canSubmit = message.trim().length > 0 && !isLoading;

  return (
    <div className={cn('border-t bg-background', className)}>
      <form
        onSubmit={handleSubmit}
        className="max-w-3xl mx-auto px-4 py-4"
      >
        <div
          className={cn(
            'relative flex items-end gap-2 rounded-2xl border bg-background',
            'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
            'transition-shadow'
          )}
        >
          {/* Textarea */}
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message Sequenzia..."
            disabled={isLoading}
            className={cn(
              'flex-1 min-h-[44px] max-h-[200px] resize-none border-0',
              'focus-visible:ring-0 focus-visible:ring-offset-0',
              'bg-transparent py-3 px-4',
              'placeholder:text-muted-foreground/60'
            )}
            rows={1}
          />

          {/* Actions */}
          <div className="flex items-center gap-1 p-2">
            {/* Submit button */}
            <Button
              type="submit"
              size="icon"
              disabled={!canSubmit}
              className={cn(
                'h-8 w-8 rounded-full shrink-0',
                'transition-all duration-200',
                canSubmit
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              )}
            >
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="send"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    <Send className="w-4 h-4" />
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
          </div>
        </div>

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
      </form>
    </div>
  );
});
