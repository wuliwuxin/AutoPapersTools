/**
 * Model Selector Component
 * Allows users to select which LLM model to use for analysis
 */

import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

interface ModelSelectorProps {
  onSelect: (provider: string, modelName: string) => void;
  selectedProvider?: string;
  selectedModel?: string;
}

export function ModelSelector({ onSelect, selectedProvider, selectedModel }: ModelSelectorProps) {
  const { data: apiKeys } = trpc.apiKeys.list.useQuery();
  const [provider, setProvider] = useState(selectedProvider || '');
  const [model, setModel] = useState(selectedModel || '');

  // Group keys by provider
  const keysByProvider = apiKeys?.reduce((acc, key) => {
    if (!acc[key.provider]) {
      acc[key.provider] = [];
    }
    acc[key.provider].push(key);
    return acc;
  }, {} as Record<string, typeof apiKeys>);

  const handleProviderChange = (newProvider: string) => {
    setProvider(newProvider);
    const firstModel = keysByProvider?.[newProvider]?.[0]?.modelName || '';
    setModel(firstModel);
    onSelect(newProvider, firstModel);
  };

  const handleModelChange = (newModel: string) => {
    setModel(newModel);
    onSelect(provider, newModel);
  };

  if (!apiKeys || apiKeys.length === 0) {
    return (
      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-gray-600">
            No API keys configured. Please add an API key in settings to use analysis features.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Provider</Label>
        <Select value={provider} onValueChange={handleProviderChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select provider" />
          </SelectTrigger>
          <SelectContent>
            {Object.keys(keysByProvider || {}).map((p) => (
              <SelectItem key={p} value={p}>
                <span className="capitalize">{p}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {provider && (
        <div className="space-y-2">
          <Label>Model</Label>
          <Select value={model} onValueChange={handleModelChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select model" />
            </SelectTrigger>
            <SelectContent>
              {keysByProvider?.[provider]?.map((key) => (
                <SelectItem key={key.id} value={key.modelName}>
                  {key.modelName}
                  {key.isDefault && ' (Default)'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
