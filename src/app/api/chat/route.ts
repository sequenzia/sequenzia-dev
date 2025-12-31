import { streamText, gateway, tool, type UIMessage, type ModelMessage } from 'ai';
import { z } from 'zod';
import {
  FormFieldSchema,
  ChartContentDataSchema,
  CodeContentDataSchema,
  CardContentDataSchema,
} from '@/types/message';
import { DEFAULT_MODEL_ID, isValidModelId } from '@/lib/models';

export const maxDuration = 60;

// Convert UI messages (from DefaultChatTransport) to model messages (for streamText)
function convertToModelMessages(uiMessages: UIMessage[]): ModelMessage[] {
  const result: ModelMessage[] = [];

  for (const msg of uiMessages) {
    // Extract text content from parts
    let textContent = '';
    const toolCalls: Array<{
      toolCallId: string;
      toolName: string;
      args: Record<string, unknown>;
      output?: unknown;
    }> = [];

    if (msg.parts) {
      for (const part of msg.parts) {
        if (part.type === 'text') {
          textContent += part.text;
        } else if (part.type.startsWith('tool-')) {
          // Tool parts have type like 'tool-generateForm', 'tool-generateChart', etc.
          const toolPart = part as {
            type: string;
            toolCallId: string;
            input?: unknown;
            output?: unknown;
            state?: string;
          };
          const toolName = part.type.replace('tool-', '');
          toolCalls.push({
            toolCallId: toolPart.toolCallId,
            toolName: toolName,
            args: (toolPart.input as Record<string, unknown>) || {},
            output: toolPart.output,
          });
        }
      }
    }

    if (msg.role === 'user') {
      result.push({
        role: 'user',
        content: textContent,
      });
    } else if (msg.role === 'assistant') {
      if (toolCalls.length > 0) {
        result.push({
          role: 'assistant',
          content: [
            ...(textContent ? [{ type: 'text' as const, text: textContent }] : []),
            ...toolCalls.map((tc) => ({
              type: 'tool-call' as const,
              toolCallId: tc.toolCallId,
              toolName: tc.toolName,
              input: tc.args,
            })),
          ],
        });

        // Add tool results for tool calls that have output
        for (const tc of toolCalls) {
          if (tc.output !== undefined && tc.output !== null) {
            result.push({
              role: 'tool',
              content: [
                {
                  type: 'tool-result',
                  toolCallId: tc.toolCallId,
                  toolName: tc.toolName,
                  output: {
                    type: 'text' as const,
                    value: JSON.stringify(tc.output),
                  },
                },
              ],
            });
          }
        }
      } else {
        result.push({
          role: 'assistant',
          content: textContent,
        });
      }
    }
  }

  return result;
}

export async function POST(req: Request) {
  const { messages: uiMessages, modelId } = await req.json();

  // Validate and use the provided model or fall back to default
  const selectedModelId = isValidModelId(modelId) ? modelId : DEFAULT_MODEL_ID;

  // Convert UI messages to model messages
  const messages = convertToModelMessages(uiMessages);

  const result = streamText({
    model: gateway(selectedModelId),
    system: `You are Sequenzia, a helpful AI assistant with the ability to create interactive content.

When appropriate, you can generate:
- **Forms**: For collecting user input (surveys, registrations, feedback)
- **Charts**: For visualizing data (line, bar, pie, area charts)
- **Code**: For displaying code snippets with syntax highlighting
- **Cards**: For presenting structured information with optional media

Use these tools when they would enhance the conversation. For simple text responses, just reply normally.

Be helpful, concise, and friendly. When generating interactive content, make it practical and useful.`,
    messages,
    tools: {
      generateForm: tool({
        description:
          'Generate an interactive form for collecting user input. Use this for surveys, registrations, feedback forms, or any structured data collection.',
        inputSchema: z.object({
          type: z.literal('form'),
          title: z.string().describe('The form title'),
          description: z
            .string()
            .optional()
            .describe('Optional description explaining the form purpose'),
          fields: z
            .array(FormFieldSchema)
            .describe('Array of form fields to display'),
          submitLabel: z
            .string()
            .optional()
            .describe('Custom label for the submit button'),
        }),
        execute: async (params) => params,
      }),

      generateChart: tool({
        description:
          'Generate a data visualization chart. IMPORTANT: You MUST include the "data" array with actual numerical values. The data array should contain objects with keys matching xKey and yKey. Example: if xKey="year" and yKey="value", then data should be [{"year": "2020", "value": 100}, {"year": "2021", "value": 150}]. Generate realistic data based on your knowledge.',
        inputSchema: ChartContentDataSchema,
        execute: async (params) => params,
      }),

      generateCode: tool({
        description:
          'Generate a code block with syntax highlighting. Use this to display code examples, snippets, or complete files.',
        inputSchema: CodeContentDataSchema,
        execute: async (params) => params,
      }),

      generateCard: tool({
        description:
          'Generate a rich content card for displaying structured information. Use this for summaries, previews, or content with optional media.',
        inputSchema: CardContentDataSchema,
        execute: async (params) => params,
      }),
    },
  });

  return result.toUIMessageStreamResponse();
}
