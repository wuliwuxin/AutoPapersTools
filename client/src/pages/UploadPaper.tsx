/**
 * Upload Paper Page
 * Allows users to upload local PDF files for analysis
 */

import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { Upload, FileText, ArrowLeft, AlertTriangle, Settings, Loader2 } from 'lucide-react';

export default function UploadPaper() {
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [authors, setAuthors] = useState('');
  const [abstract, setAbstract] = useState('');
  const [introduction, setIntroduction] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [hasApiKeys, setHasApiKeys] = useState(false);

  // 检查用户是否有 API 密钥
  const { data: apiKeys } = trpc.apiKeys.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // 使用 useEffect 更新 hasApiKeys 状态
  useEffect(() => {
    if (apiKeys) {
      setHasApiKeys(apiKeys.length > 0);
    }
  }, [apiKeys]);

  const uploadMutation = trpc.papers.uploadLocal.useMutation({
    onSuccess: (data) => {
      toast.success('论文上传成功！');
      // 跳转到论文详情页
      navigate(`/paper/${data.paperId}`);
    },
    onError: (error) => {
      toast.error(error.message || '上传失败');
      setIsUploading(false);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // 验证文件类型
      if (selectedFile.type !== 'application/pdf' && !selectedFile.name.endsWith('.pdf')) {
        toast.error('请上传 PDF 文件');
        return;
      }
      
      // 验证文件大小（最大 10MB）
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error('文件大小不能超过 10MB');
        return;
      }
      
      setFile(selectedFile);
      
      // 如果没有填写标题，使用文件名
      if (!title) {
        setTitle(selectedFile.name.replace('.pdf', ''));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error('请先登录');
      navigate('/login?redirect=/upload');
      return;
    }
    
    if (!file) {
      toast.error('请选择文件');
      return;
    }
    
    if (!title.trim()) {
      toast.error('请输入论文标题');
      return;
    }
    
    if (!abstract.trim()) {
      toast.error('请输入论文摘要');
      return;
    }
    
    setIsUploading(true);
    
    try {
      // 读取文件内容
      const reader = new FileReader();
      reader.onload = async (event) => {
        const content = event.target?.result as string;
        
        // 上传论文
        await uploadMutation.mutateAsync({
          title: title.trim(),
          authors: authors.trim() || '未知作者',
          abstract: abstract.trim(),
          introduction: introduction.trim() || undefined,
          fileContent: content,
          fileName: file.name,
        });
      };
      
      reader.onerror = () => {
        toast.error('文件读取失败');
        setIsUploading(false);
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Upload error:', error);
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          返回主页
        </Button>

        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">上传本地论文</h1>
          <p className="text-muted-foreground mb-8">
            上传 PDF 格式的论文文件，系统将自动进行深度分析
          </p>

          {/* API 密钥提示 */}
          {isAuthenticated && !hasApiKeys && (
            <Alert className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>您还没有配置 API 密钥，上传后无法进行深度分析</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/profile')}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  配置 API 密钥
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader>
              <CardTitle>论文信息</CardTitle>
              <CardDescription>
                请填写论文的基本信息并上传 PDF 文件
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* 文件上传 */}
                <div className="space-y-2">
                  <Label htmlFor="file">PDF 文件 *</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      id="file"
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={handleFileChange}
                      disabled={isUploading}
                      className="cursor-pointer"
                    />
                    {file && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <FileText className="h-4 w-4" />
                        <span>{(file.size / 1024).toFixed(0)} KB</span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    支持 PDF 格式，最大 10MB
                  </p>
                </div>

                {/* 标题 */}
                <div className="space-y-2">
                  <Label htmlFor="title">论文标题 *</Label>
                  <Input
                    id="title"
                    type="text"
                    placeholder="例如：Attention Is All You Need"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={isUploading}
                    required
                  />
                </div>

                {/* 作者 */}
                <div className="space-y-2">
                  <Label htmlFor="authors">作者（可选）</Label>
                  <Input
                    id="authors"
                    type="text"
                    placeholder="例如：Ashish Vaswani, Noam Shazeer"
                    value={authors}
                    onChange={(e) => setAuthors(e.target.value)}
                    disabled={isUploading}
                  />
                  <p className="text-xs text-muted-foreground">
                    多个作者请用逗号分隔
                  </p>
                </div>

                {/* 摘要 */}
                <div className="space-y-2">
                  <Label htmlFor="abstract">论文摘要 *</Label>
                  <textarea
                    id="abstract"
                    className="w-full min-h-[120px] px-3 py-2 border rounded-md resize-y"
                    placeholder="请输入论文摘要..."
                    value={abstract}
                    onChange={(e) => setAbstract(e.target.value)}
                    disabled={isUploading}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    摘要将用于 AI 分析，请尽量详细
                  </p>
                </div>

                {/* 引言 */}
                <div className="space-y-2">
                  <Label htmlFor="introduction">论文引言（推荐）</Label>
                  <textarea
                    id="introduction"
                    className="w-full min-h-[150px] px-3 py-2 border rounded-md resize-y"
                    placeholder="请输入论文引言部分，包括研究背景、动机、主要贡献等..."
                    value={introduction}
                    onChange={(e) => setIntroduction(e.target.value)}
                    disabled={isUploading}
                  />
                  <p className="text-xs text-muted-foreground">
                    引言部分能显著提升 AI 分析质量，强烈建议填写
                  </p>
                </div>

                {/* 提交按钮 */}
                <div className="flex gap-4">
                  <Button
                    type="submit"
                    disabled={isUploading || !file}
                    className="flex-1"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        上传中...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        上传并分析
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/')}
                    disabled={isUploading}
                  >
                    取消
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* 使用说明 */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">使用说明</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>1. 选择本地的 PDF 格式论文文件</p>
              <p>2. 填写论文的标题和摘要（必填）</p>
              <p>3. <strong className="text-foreground">强烈建议填写引言部分</strong>，这将显著提升 AI 分析质量</p>
              <p>4. 可选填写作者信息</p>
              <p>5. 点击"上传并分析"按钮</p>
              <p>6. 系统会自动跳转到论文详情页</p>
              <p>7. 在详情页可以开始深度分析</p>
            </CardContent>
          </Card>

          {/* 提示信息 */}
          <Card className="mt-4 border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <p className="text-sm text-blue-900">
                <strong>💡 提示：</strong>为了获得更准确的分析结果，建议在"引言"字段中包含：
              </p>
              <ul className="mt-2 ml-4 text-sm text-blue-800 list-disc space-y-1">
                <li>研究背景和动机</li>
                <li>现有方法的局限性</li>
                <li>本文的主要贡献</li>
                <li>论文的组织结构</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
