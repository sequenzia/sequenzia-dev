import { z } from 'zod';

// Expansion States
export type ExpansionState = 'collapsed' | 'partial' | 'expanded' | 'focused';

export const ExpansionStateSchema = z.enum(['collapsed', 'partial', 'expanded', 'focused']);

// Form Field Types
export interface FormFieldOption {
  label: string;
  value: string;
}

export interface FormField {
  id: string;
  type: 'text' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date' | 'slider' | 'file' | 'number' | 'email';
  label: string;
  placeholder?: string;
  required?: boolean;
  defaultValue?: string | number | boolean;
  options?: FormFieldOption[];
  min?: number;
  max?: number;
  step?: number;
}

export const FormFieldSchema = z.object({
  id: z.string(),
  type: z.enum(['text', 'textarea', 'select', 'checkbox', 'radio', 'date', 'slider', 'file', 'number', 'email']),
  label: z.string(),
  placeholder: z.string().optional(),
  required: z.boolean().optional(),
  defaultValue: z.union([z.string(), z.number(), z.boolean()]).optional(),
  options: z.array(z.object({ label: z.string(), value: z.string() })).optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  step: z.number().optional(),
});

// Expandable Content Types
export interface FormContentData {
  type: 'form';
  title: string;
  description?: string;
  fields: FormField[];
  submitLabel?: string;
}

export const FormContentDataSchema = z.object({
  type: z.literal('form'),
  title: z.string(),
  description: z.string().optional(),
  fields: z.array(FormFieldSchema),
  submitLabel: z.string().optional(),
});

export interface ChartDataPoint {
  [key: string]: string | number;
}

export interface ChartContentData {
  type: 'chart';
  chartType: 'line' | 'bar' | 'pie' | 'area';
  title: string;
  description?: string;
  data: ChartDataPoint[];
  xKey: string;
  yKey: string;
  config?: Record<string, { label: string; color?: string }>;
}

export const ChartContentDataSchema = z.object({
  type: z.literal('chart').describe('Must be "chart"'),
  chartType: z.enum(['line', 'bar', 'pie', 'area']).describe('The type of chart to render'),
  title: z.string().describe('The chart title'),
  description: z.string().optional().describe('Optional description of what the chart shows'),
  data: z
    .array(z.record(z.string(), z.union([z.string(), z.number()])))
    .describe(
      'Array of data points. Each object must have keys matching xKey and yKey. Example: [{ "year": 2020, "value": 100 }, { "year": 2021, "value": 150 }]'
    ),
  xKey: z.string().describe('The key in data objects to use for the x-axis (e.g., "year")'),
  yKey: z.string().describe('The key in data objects to use for the y-axis (e.g., "value")'),
  config: z
    .record(z.string(), z.object({ label: z.string(), color: z.string().optional() }))
    .optional()
    .describe('Optional configuration for data series labels and colors'),
});

export interface CodeContentData {
  type: 'code';
  language: string;
  filename?: string;
  code: string;
  editable?: boolean;
  showLineNumbers?: boolean;
}

export const CodeContentDataSchema = z.object({
  type: z.literal('code'),
  language: z.string(),
  filename: z.string().optional(),
  code: z.string(),
  editable: z.boolean().optional(),
  showLineNumbers: z.boolean().optional(),
});

export interface CardAction {
  label: string;
  action: string;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

export interface CardContentData {
  type: 'card';
  title: string;
  description?: string;
  content?: string;
  media?: {
    type: 'image' | 'video';
    url: string;
    alt?: string;
  };
  actions?: CardAction[];
}

export const CardContentDataSchema = z.object({
  type: z.literal('card'),
  title: z.string(),
  description: z.string().optional(),
  content: z.string().optional(),
  media: z.object({
    type: z.enum(['image', 'video']),
    url: z.string(),
    alt: z.string().optional(),
  }).optional(),
  actions: z.array(z.object({
    label: z.string(),
    action: z.string(),
    variant: z.enum(['default', 'secondary', 'destructive', 'outline']).optional(),
  })).optional(),
});

// Union of all expandable content types
export type ExpandableContent =
  | FormContentData
  | ChartContentData
  | CodeContentData
  | CardContentData;

export const ExpandableContentSchema = z.discriminatedUnion('type', [
  FormContentDataSchema,
  ChartContentDataSchema,
  CodeContentDataSchema,
  CardContentDataSchema,
]);

// Attachment type for file uploads
export interface Attachment {
  id: string;
  name: string;
  type: string;
  url: string;
  size: number;
}

// Tool invocation for AI tool calls
export interface ToolInvocation {
  id: string;
  toolName: string;
  args: Record<string, unknown>;
  state: 'pending' | 'result' | 'error';
  result?: unknown;
}

// Main Message type
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  attachments?: Attachment[];
  expandableContent?: ExpandableContent;
  toolInvocations?: ToolInvocation[];
}

// Expansion state tracking per message
export interface ExpansionStateData {
  messageId: string;
  state: ExpansionState;
  pinned: boolean;
  interactionDepth: number;
}
