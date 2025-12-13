/**
 * API Keys Settings Page
 */

import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Trash2, Plus, Star } from 'lucide-react';

const PROVIDERS = [
  { value: 'deepseek', label: 'DeepSeek', models: ['deepseek-chat', 'deepseek-coder'] },
  { value: 'openai', label: 'OpenAI', models: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'] },
  { value: 'claude', label: 'Claude', models: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'] },
  { value: 'gemini', label: 'Gemini', models: ['gemini-pro', 'gemini-pro-vision'] },
];

export function ApiKeys() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [provider, setProvider] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [modelName, setModelName] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  const { data: apiKeys, refetch } = trpc.apiKeys.list.useQuery();

  const addMutation = trpc.apiKeys.add.useMutation({
    onSuccess: () => {
      toast.success('API key added successfully');
      setShowAddForm(false);
      setProvider('');
      setApiKey('');
      setModelName('');
      setIsDefault(false);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = trpc.apiKeys.delete.useMutation({
    onSuccess: () => {
      toast.success('API key deleted successfully');
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateMutation = trpc.apiKeys.update.useMutation({
    onSuccess: () => {
      toast.success('API key updated successfully');
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await addMutation.mutateAsync({
      provider: provider as any,
      apiKey,
      modelName,
      isDefault,
    });
  };

  const handleDelete = async (keyId: number) => {
    if (confirm('Are you sure you want to delete this API key?')) {
      await deleteMutation.mutateAsync({ keyId });
    }
  };

  const handleSetDefault = async (keyId: number) => {
    await updateMutation.mutateAsync({ keyId, isDefault: true });
  };

  const selectedProvider = PROVIDERS.find((p) => p.value === provider);

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">API Keys</h1>
        <p className="text-gray-600">
          Manage your LLM API keys for paper analysis
        </p>
      </div>

      {/* Existing Keys */}
      <div className="space-y-4 mb-8">
        {apiKeys?.map((key) => (
          <Card key={key.id}>
            <CardContent className="flex items-center justify-between p-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold capitalize">{key.provider}</h3>
                  {key.isDefault && (
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  )}
                </div>
                <p className="text-sm text-gray-600">{key.modelName}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {key.apiKeyPreview}
                </p>
                {key.lastUsedAt && (
                  <p className="text-xs text-gray-400 mt-1">
                    Last used: {new Date(key.lastUsedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                {!key.isDefault && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSetDefault(key.id)}
                  >
                    Set Default
                  </Button>
                )}
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(key.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {apiKeys?.length === 0 && (
          <Card>
            <CardContent className="p-6 text-center text-gray-500">
              No API keys added yet. Add one to start analyzing papers.
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add New Key */}
      {!showAddForm ? (
        <Button onClick={() => setShowAddForm(true)} className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Add API Key
        </Button>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Add New API Key</CardTitle>
            <CardDescription>
              Add an API key from your preferred LLM provider
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="provider">Provider</Label>
                <Select value={provider} onValueChange={setProvider} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROVIDERS.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {provider && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="model">Model</Label>
                    <Select value={modelName} onValueChange={setModelName} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select model" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedProvider?.models.map((model) => (
                          <SelectItem key={model} value={model}>
                            {model}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="apiKey">API Key</Label>
                    <Input
                      id="apiKey"
                      type="password"
                      placeholder="sk-..."
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      required
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isDefault"
                      checked={isDefault}
                      onChange={(e) => setIsDefault(e.target.checked)}
                      className="rounded"
                    />
                    <Label htmlFor="isDefault" className="cursor-pointer">
                      Set as default
                    </Label>
                  </div>
                </>
              )}

              <div className="flex gap-2">
                <Button type="submit" disabled={addMutation.isPending}>
                  {addMutation.isPending ? 'Adding...' : 'Add Key'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
