import { tool } from 'ai';
import { z } from 'zod';
import {
  FormFieldSchema,
  ChartContentDataSchema,
  CodeContentDataSchema,
  CardContentDataSchema,
} from '@/types/message';

export const generateForm = tool({
  description:
    'Generate an interactive form for collecting user input. Use this for surveys, registrations, feedback forms, or any structured data collection.',
  inputSchema: z.object({
    type: z.literal('form'),
    title: z.string().describe('The form title'),
    description: z
      .string()
      .optional()
      .describe('Optional description explaining the form purpose'),
    fields: z.array(FormFieldSchema).describe('Array of form fields to display'),
    submitLabel: z
      .string()
      .optional()
      .describe('Custom label for the submit button'),
  }),
  strict: true,
  execute: async (params) => params,
});

export const generateChart = tool({
  description:
    'Generate a data visualization chart. You MUST include the "data" array with objects containing "label" (string) and "value" (number). Example: [{"label": "2020", "value": 21.0}, {"label": "2021", "value": 23.3}]. Generate realistic data based on your knowledge.',
  inputSchema: ChartContentDataSchema,
  strict: true,
  execute: async (params) => params,
});

export const generateCode = tool({
  description:
    'Generate a code block with syntax highlighting. Use this to display code examples, snippets, or complete files.',
  inputSchema: CodeContentDataSchema,
  strict: true,
  execute: async (params) => params,
});

export const generateCard = tool({
  description:
    'Generate a rich content card for displaying structured information. Use this for summaries, previews, or content with optional media.',
  inputSchema: CardContentDataSchema,
  strict: true,
  execute: async (params) => params,
});

export const chatTools = {
  generateForm,
  generateChart,
  generateCode,
  generateCard,
};
