'use client';

import { Bot } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useChat } from '@/components/chat/ChatProvider';
import { MODELS, getModelById } from '@/lib/models';

export function ModelPicker() {
  const { modelId, setModelId, isLoading } = useChat();
  const currentModel = getModelById(modelId);

  return (
    <Select value={modelId} onValueChange={setModelId} disabled={isLoading}>
      <SelectTrigger className="w-[180px] h-9">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-muted-foreground" />
          <SelectValue>
            {currentModel?.name ?? 'Select model'}
          </SelectValue>
        </div>
      </SelectTrigger>
      <SelectContent>
        {MODELS.map((model) => (
          <SelectItem key={model.id} value={model.id}>
            <div className="flex flex-col">
              <span>{model.name}</span>
              <span className="text-xs text-muted-foreground">
                {model.provider}
              </span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
