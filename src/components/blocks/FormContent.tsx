'use client';

import { memo, useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { useChat } from '@/components/chat/ChatProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import {
  springs,
  formFieldContainer,
  formField,
  successBounce,
  checkmarkDraw,
  useAnimationConfig,
} from '@/lib/motion';
import type { FormContentData, FormField } from '@/types';

interface FormContentProps {
  content: FormContentData;
  messageId?: string;
}

export const FormContent = memo(function FormContent({
  content,
}: FormContentProps) {
  const { sendMessage } = useChat();
  const [formData, setFormData] = useState<Record<string, string | number | boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const { hoverGesture, tapGesture } = useAnimationConfig();

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

  if (submitted) {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={successBounce}
        className="flex flex-col items-center justify-center py-6 text-center"
      >
        <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-3">
          <motion.svg
            className="w-6 h-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <motion.path
              d="M5 13l4 4L19 7"
              className="text-green-600 dark:text-green-400"
              initial="hidden"
              animate="visible"
              variants={checkmarkDraw}
            />
          </motion.svg>
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
      initial="hidden"
      animate="visible"
      variants={formFieldContainer}
      onClick={(e) => e.stopPropagation()}
      className="space-y-4 rounded-lg border bg-card p-4"
    >
      {/* Header */}
      <motion.div variants={formField}>
        <h4 className="font-medium text-base">{content.title}</h4>
        {content.description && (
          <p className="text-sm text-muted-foreground mt-1">
            {content.description}
          </p>
        )}
      </motion.div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {content.fields.map((field) => (
          <motion.div key={field.id} variants={formField}>
            <FormFieldRenderer
              field={field}
              value={formData[field.id]}
              onChange={(value) => handleFieldChange(field.id, value)}
            />
          </motion.div>
        ))}

        {/* Submit button with gesture feedback */}
        <motion.div
          whileHover={hoverGesture}
          whileTap={tapGesture}
          transition={springs.snappy}
        >
          <Button type="submit" className="w-full">
            {content.submitLabel || 'Submit'}
          </Button>
        </motion.div>
      </form>
    </motion.div>
  );
});

interface FormFieldRendererProps {
  field: FormField;
  value: string | number | boolean | undefined;
  onChange: (value: string | number | boolean) => void;
}

function FormFieldRenderer({
  field,
  value,
  onChange,
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
          required={field.required}
          className="min-h-[80px]"
        />
      ) : field.type === 'select' && field.options ? (
        <select
          id={field.id}
          value={stringValue}
          onChange={(e) => onChange(e.target.value)}
          required={field.required}
          className={cn(
            'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
            'ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
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
          required={field.required}
          min={field.min}
          max={field.max}
          step={field.step}
        />
      )}
    </div>
  );
}
