'use client';

import { memo, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FileText, Check } from 'lucide-react';
import { useChat } from '@/components/chat/ChatProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { FormContentData, FormField } from '@/types';

interface FormContentProps {
  content: FormContentData;
  displayMode: 'preview' | 'partial' | 'full';
  messageId: string;
}

export const FormContent = memo(function FormContent({
  content,
  displayMode,
  messageId,
}: FormContentProps) {
  const { sendMessage } = useChat();
  const [formData, setFormData] = useState<Record<string, string | number | boolean>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleFieldChange = useCallback(
    (fieldId: string, value: string | number | boolean) => {
      setFormData((prev) => ({ ...prev, [fieldId]: value }));
    },
    []
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // Format form data as a message
      const formattedData = content.fields
        .map((field) => {
          const value = formData[field.id] ?? field.defaultValue ?? '';
          return `${field.label}: ${value}`;
        })
        .join('\n');

      sendMessage(`Form submission for "${content.title}":\n\n${formattedData}`);
      setSubmitted(true);
    },
    [content, formData, sendMessage]
  );

  // Preview mode - just show icon and title
  if (displayMode === 'preview') {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <FileText className="w-4 h-4" />
        <span className="text-sm">{content.title}</span>
        <Badge variant="secondary" className="text-xs">
          {content.fields.length} fields
        </Badge>
      </div>
    );
  }

  // Determine which fields to show
  const visibleFields =
    displayMode === 'partial'
      ? content.fields.slice(0, 3)
      : content.fields;

  const hasMoreFields = displayMode === 'partial' && content.fields.length > 3;

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-6 text-center"
      >
        <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-3">
          <Check className="w-6 h-6 text-green-600 dark:text-green-400" />
        </div>
        <h4 className="font-medium mb-1">Form Submitted</h4>
        <p className="text-sm text-muted-foreground">
          Your response has been sent.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={(e) => e.stopPropagation()}
      className="space-y-4"
    >
      {/* Header */}
      <div>
        <h4 className="font-medium text-base">{content.title}</h4>
        {content.description && (
          <p className="text-sm text-muted-foreground mt-1">
            {content.description}
          </p>
        )}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {visibleFields.map((field, index) => (
          <motion.div
            key={field.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <FormFieldRenderer
              field={field}
              value={formData[field.id]}
              onChange={(value) => handleFieldChange(field.id, value)}
              disabled={displayMode === 'partial'}
            />
          </motion.div>
        ))}

        {/* More fields indicator */}
        {hasMoreFields && (
          <p className="text-sm text-muted-foreground italic">
            +{content.fields.length - 3} more fields...
          </p>
        )}

        {/* Submit button (only in full mode) */}
        {displayMode === 'full' && (
          <Button type="submit" className="w-full">
            {content.submitLabel || 'Submit'}
          </Button>
        )}
      </form>
    </motion.div>
  );
});

interface FormFieldRendererProps {
  field: FormField;
  value: string | number | boolean | undefined;
  onChange: (value: string | number | boolean) => void;
  disabled?: boolean;
}

function FormFieldRenderer({
  field,
  value,
  onChange,
  disabled,
}: FormFieldRendererProps) {
  const stringValue = value?.toString() ?? '';

  return (
    <div className="space-y-2">
      <Label htmlFor={field.id} className="flex items-center gap-1">
        {field.label}
        {field.required && <span className="text-destructive">*</span>}
      </Label>

      {field.type === 'textarea' ? (
        <Textarea
          id={field.id}
          placeholder={field.placeholder}
          value={stringValue}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          required={field.required}
          className="min-h-[80px] bg-[var(--form-field)]"
        />
      ) : field.type === 'select' && field.options ? (
        <select
          id={field.id}
          value={stringValue}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          required={field.required}
          className={cn(
            'flex h-10 w-full rounded-md border border-input bg-[var(--form-field)] px-3 py-2 text-sm',
            'ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50'
          )}
        >
          <option value="">Select an option...</option>
          {field.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : field.type === 'checkbox' ? (
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id={field.id}
            checked={value === true || value === 'true'}
            onChange={(e) => onChange(e.target.checked)}
            disabled={disabled}
            className="h-4 w-4 rounded border-input"
          />
          {field.placeholder && (
            <span className="text-sm text-muted-foreground">
              {field.placeholder}
            </span>
          )}
        </div>
      ) : field.type === 'slider' ? (
        <div className="flex items-center gap-4">
          <input
            type="range"
            id={field.id}
            min={field.min ?? 0}
            max={field.max ?? 100}
            step={field.step ?? 1}
            value={Number(value) || field.min || 0}
            onChange={(e) => onChange(Number(e.target.value))}
            disabled={disabled}
            className="flex-1"
          />
          <span className="text-sm font-medium w-12 text-right">
            {value ?? field.min ?? 0}
          </span>
        </div>
      ) : (
        <Input
          id={field.id}
          type={field.type === 'email' ? 'email' : field.type === 'number' ? 'number' : 'text'}
          placeholder={field.placeholder}
          value={stringValue}
          onChange={(e) =>
            onChange(
              field.type === 'number'
                ? Number(e.target.value)
                : e.target.value
            )
          }
          disabled={disabled}
          required={field.required}
          min={field.min}
          max={field.max}
          step={field.step}
          className="bg-[var(--form-field)]"
        />
      )}
    </div>
  );
}
