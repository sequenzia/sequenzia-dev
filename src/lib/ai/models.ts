export interface Model {
  id: string;
  name: string;
  provider: string;
  description?: string;
}

export const MODELS: Model[] = [
  {
    id: "openai/gpt-5-nano",
    name: "GPT-5 Nano",
    provider: "OpenAI",
    description: "Fast and efficient",
  },
  // {
  //   id: "openai/gpt-5-mini",
  //   name: "GPT-5 Mini",
  //   provider: "OpenAI",
  //   description: "Fast and efficient, but more capable than GPT-5 Nano",
  // },
  {
    id: "openai/gpt-4o-mini",
    name: "GPT-4o Mini",
    provider: "OpenAI",
    description: "Fast and efficient",
  },
  // {
  //   id: "openai/gpt-4o",
  //   name: "GPT-4o",
  //   provider: "OpenAI",
  //   description: "Most capable OpenAI model",
  // },
  // {
  //   id: "anthropic/claude-sonnet-4",
  //   name: "Claude Sonnet 4",
  //   provider: "Anthropic",
  //   description: "Balanced performance",
  // },
  {
    id: "google/gemini-2.0-flash",
    name: "Gemini 2.0 Flash",
    provider: "Google",
    description: "Fast multimodal model",
  },
  {
    id: "deepseek/deepseek-v3.2",
    name: "DeepSeek V3.2",
    provider: "DeepSeek",
    description: "Fast and efficient",
  },
];

export const DEFAULT_MODEL_ID = "openai/gpt-5-nano";

export function getModelById(id: string): Model | undefined {
  return MODELS.find((model) => model.id === id);
}

export function isValidModelId(id: string): boolean {
  return MODELS.some((model) => model.id === id);
}
