import { streamText, gateway, convertToModelMessages } from "ai";
import { DEFAULT_MODEL_ID, isValidModelId } from "@/lib/models";
import { getSystemPrompt } from "@/lib/prompts";
import { chatTools } from "@/lib/tools";

export const maxDuration = 60;

export async function POST(req: Request) {
  const { messages: uiMessages, modelId } = await req.json();

  const selectedModelId = isValidModelId(modelId) ? modelId : DEFAULT_MODEL_ID;
  const model = gateway(selectedModelId);
  const systemPrompt = getSystemPrompt();

  const messages = await convertToModelMessages(uiMessages);

  const result = streamText({
    model,
    system: systemPrompt,
    messages,
    tools: chatTools,
  });

  return result.toUIMessageStreamResponse();
}
