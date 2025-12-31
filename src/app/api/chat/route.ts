import { streamText, gateway, type UIMessage, type ModelMessage } from "ai";
import { DEFAULT_MODEL_ID, isValidModelId } from "@/lib/models";
import { getSystemPrompt } from "@/lib/prompts";
import { chatTools } from "@/lib/tools";

export const maxDuration = 60;

// Convert UI messages (from DefaultChatTransport) to model messages (for streamText)
function convertToModelMessages(uiMessages: UIMessage[]): ModelMessage[] {
  const result: ModelMessage[] = [];

  for (const msg of uiMessages) {
    // Extract text content from parts
    let textContent = "";
    const toolCalls: Array<{
      toolCallId: string;
      toolName: string;
      args: Record<string, unknown>;
      output?: unknown;
    }> = [];

    if (msg.parts) {
      for (const part of msg.parts) {
        if (part.type === "text") {
          textContent += part.text;
        } else if (part.type.startsWith("tool-")) {
          // Tool parts have type like 'tool-generateForm', 'tool-generateChart', etc.
          const toolPart = part as {
            type: string;
            toolCallId: string;
            input?: unknown;
            output?: unknown;
            state?: string;
          };
          const toolName = part.type.replace("tool-", "");
          toolCalls.push({
            toolCallId: toolPart.toolCallId,
            toolName: toolName,
            args: (toolPart.input as Record<string, unknown>) || {},
            output: toolPart.output,
          });
        }
      }
    }

    if (msg.role === "user") {
      result.push({
        role: "user",
        content: textContent,
      });
    } else if (msg.role === "assistant") {
      if (toolCalls.length > 0) {
        result.push({
          role: "assistant",
          content: [
            ...(textContent
              ? [{ type: "text" as const, text: textContent }]
              : []),
            ...toolCalls.map((tc) => ({
              type: "tool-call" as const,
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
              role: "tool",
              content: [
                {
                  type: "tool-result",
                  toolCallId: tc.toolCallId,
                  toolName: tc.toolName,
                  output: {
                    type: "text" as const,
                    value: JSON.stringify(tc.output),
                  },
                },
              ],
            });
          }
        }
      } else {
        result.push({
          role: "assistant",
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

  const model = gateway(selectedModelId);

  // Convert UI messages to model messages
  const messages = convertToModelMessages(uiMessages);

  const systemPrompt = getSystemPrompt();

  console.log("model", model);
  console.log("systemPrompt", systemPrompt);
  console.log("messages", messages);
  console.log("tools", chatTools);

  const result = streamText({
    model: model,
    system: systemPrompt,
    messages: messages,
    tools: chatTools,
  });

  return result.toUIMessageStreamResponse();
}
