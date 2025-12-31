export interface Model {
  id: string;
  name: string;
  provider: string;
  providerSlug: string;
  description?: string;
}

export const MODELS: Model[] = [
  {
    id: "openai/gpt-5-nano",
    name: "GPT-5 Nano",
    provider: "OpenAI",
    providerSlug: "openai",
    description: "Fast and efficient",
  },
  {
    id: "openai/gpt-4o-mini",
    name: "GPT-4o Mini",
    provider: "OpenAI",
    providerSlug: "openai",
    description: "Fast and efficient",
  },
  {
    id: "google/gemini-2.0-flash",
    name: "Gemini 2.0 Flash",
    provider: "Google",
    providerSlug: "google",
    description: "Fast multimodal model",
  },
  {
    id: "deepseek/deepseek-v3.2",
    name: "DeepSeek V3.2",
    provider: "DeepSeek",
    providerSlug: "deepseek",
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
