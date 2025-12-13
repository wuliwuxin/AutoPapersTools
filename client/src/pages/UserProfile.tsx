/**
 * User Profile Page
 * Includes user information and API key management
 */

import { useState } from 'react';
import { useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Trash2, Plus, Star, User, Key, ArrowLeft } from 'lucide-react';

const PROVIDERS = [
  { value: 'deepseek', label: 'DeepSeek', models: ['deepseek-chat', 'deepseek-coder'] },
  { value: 'openai', label: 'OpenAI', models: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'] },
  { value: 'claude', label: 'Claude', models: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'] },
  { value: 'gemini', label: 'Gemini', models: ['gemini-pro', 'gemini-pro-vision'] },
];

export default function UserProfile() {
  const [, navigate] = useLocation();
  const { user, logout } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [provider, setProvider] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [modelName, setModelName] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  const { data: apiKeys, refetch } = trpc.apiKeys.list.useQuery();

  const addMutation = trpc.apiKeys.add.useMutation({
    onSuccess: () => {
      toast.success('API 密钥添加成功');
      setShowAddForm(false);
      setProvider('');
      setApiKey('');
      setModelName('');
      setIsDefault(false);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'API 密钥添加失败');
    },
  });

  const deleteMutation = trpc.apiKeys.delete.useMutation({
    onSuccess: () => {
      toast.success('API 密钥删除成功');
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'API 密钥删除失败');
    },
  });

  const updateMutation = trpc.apiKeys.update.useMutation({
    onSuccess: () => {
      toast.success('默认密钥设置成功');
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || '设置失败');
    },
  });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!provider || !apiKey || !modelName) {
      toast.error('请填写所有必填字段');
      return;
    }

    try {
      await addMutation.mutateAsync({
        provider: provider as any,
        apiKey,
        modelName,
        isDefault,
      });
    } catch (error) {
      console.error('Add API key error:', error);
    }
  };

  const handleDelete = async (keyId: number) => {
    if (confirm('确定要删除这个 API 密钥吗？')) {
      await deleteMutation.mutateAsync({ keyId });
    }
  };

  const handleSetDefault = async (keyId: number) => {
    await updateMutation.mutateAsync({ keyId, isDefault: true });
  };

  const selectedProvider = PROVIDERS.find((p) => p.value === provider);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          返回主页
        </Button>

        <h1 className="text-3xl font-bold mb-8">用户设置</h1>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">
              <User className="h-4 w-4 mr-2" />
              个人信息
            </TabsTrigger>
            <TabsTrigger value="apikeys">
              <Key className="h-4 w-4 mr-2" />
              API 密钥
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>个人信息</CardTitle>
                <CardDescription>
                  查看和管理您的账户信息
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>姓名</Label>
                  <p className="text-lg">{user?.name || '未设置'}</p>
                </div>
                <div>
                  <Label>邮箱</Label>
                  <p className="text-lg">{user?.email}</p>
                </div>
                <div>
                  <Label>角色</Label>
                  <p className="text-lg capitalize">{user?.role}</p>
                </div>
                <div className="pt-4">
                  <Button variant="destructive" onClick={logout}>
                    登出
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* API Keys Tab */}
          <TabsContent value="apikeys" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>API 密钥管理</CardTitle>
                <CardDescription>
                  管理您的 LLM API 密钥，用于论文深度分析
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Existing Keys */}
                <div className="space-y-4 mb-6">
                  {apiKeys && apiKeys.length > 0 ? (
                    apiKeys.map((key) => (
                      <Card key={key.id} className="border-2">
                        <CardContent className="flex items-center justify-between p-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold capitalize">{key.provider}</h3>
                              {key.isDefault && (
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{key.modelName}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              密钥: {key.apiKeyPreview}
                            </p>
                            {key.lastUsedAt && (
                              <p className="text-xs text-muted-foreground mt-1">
                                最后使用: {new Date(key.lastUsedAt).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            {!key.isDefault && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSetDefault(key.id)}
                                disabled={updateMutation.isPending}
                              >
                                设为默认
                              </Button>
                            )}
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(key.id)}
                              disabled={deleteMutation.isPending}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Card className="border-dashed">
                      <CardContent className="p-6 text-center text-muted-foreground">
                        还没有添加 API 密钥。添加一个以开始分析论文。
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Add New Key */}
                {!showAddForm ? (
                  <Button onClick={() => setShowAddForm(true)} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    添加 API 密钥
                  </Button>
                ) : (
                  <Card className="border-2 border-primary">
                    <CardHeader>
                      <CardTitle>添加新的 API 密钥</CardTitle>
                      <CardDescription>
                        从您喜欢的 LLM 提供商添加 API 密钥
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleAdd} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="provider">提供商 *</Label>
                          <Select value={provider} onValueChange={setProvider} required>
                            <SelectTrigger>
                              <SelectValue placeholder="选择提供商" />
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
                              <Label htmlFor="model">模型 *</Label>
                              <Select value={modelName} onValueChange={setModelName} required>
                                <SelectTrigger>
                                  <SelectValue placeholder="选择模型" />
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
                              <Label htmlFor="apiKey">API 密钥 *</Label>
                              <Input
                                id="apiKey"
                                type="password"
                                placeholder="sk-..."
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                required
                              />
                              <p className="text-xs text-muted-foreground">
                                您的 API 密钥将被加密存储
                              </p>
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
                                设为默认密钥
                              </Label>
                            </div>
                          </>
                        )}

                        <div className="flex gap-2">
                          <Button 
                            type="submit" 
                            disabled={addMutation.isPending || !provider || !apiKey || !modelName}
                          >
                            {addMutation.isPending ? '添加中...' : '添加密钥'}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setShowAddForm(false);
                              setProvider('');
                              setApiKey('');
                              setModelName('');
                              setIsDefault(false);
                            }}
                          >
                            取消
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
