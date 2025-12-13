import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, Heart, ExternalLink, Brain, Settings, AlertTriangle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Streamdown } from "streamdown";
import { ModelSelector } from "@/components/ModelSelector";
import { ProgressTracker } from "@/components/ProgressTracker";
import { toast } from "sonner";

export default function PaperDetail() {
  const [match, params] = useRoute("/paper/:id");
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [showAnalysisDialog, setShowAnalysisDialog] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [analysisTaskId, setAnalysisTaskId] = useState<string | null>(null);
  const [hasApiKeys, setHasApiKeys] = useState(false);

  if (!match || !params?.id) {
    return <div>Paper not found</div>;
  }

  const paperId = parseInt(params.id);

  const { data, isLoading, refetch } = trpc.papers.detail.useQuery({ paperId });
  const addFavoriteMutation = trpc.papers.addFavorite.useMutation();
  const removeFavoriteMutation = trpc.papers.removeFavorite.useMutation();
  const startAnalysisMutation = trpc.papers.startAnalysis.useMutation();
  
  // 检查用户是否有 API 密钥
  const { data: apiKeys } = trpc.apiKeys.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (apiKeys && apiKeys.length > 0) {
      setHasApiKeys(true);
    } else {
      setHasApiKeys(false);
    }
  }, [apiKeys]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!data?.paper) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">论文未找到</h1>
          <Button onClick={() => navigate("/")}>返回列表</Button>
        </div>
      </div>
    );
  }

  const { paper, report, isFavorited } = data;
  const authors = JSON.parse(paper.authors || "[]") as string[];
  const keywords = paper.keywords ? (JSON.parse(paper.keywords) as string[]) : [];

  const handleToggleFavorite = async () => {
    if (isFavorited) {
      await removeFavoriteMutation.mutateAsync({ paperId });
    } else {
      await addFavoriteMutation.mutateAsync({ paperId });
    }
  };

  const handleStartAnalysisClick = async () => {
    if (!isAuthenticated) {
      toast.error("请先登录");
      navigate(`/login?redirect=${encodeURIComponent(`/paper/${paperId}`)}`);
      return;
    }

    if (!hasApiKeys) {
      toast.error("请先配置 API 密钥");
      navigate("/profile");
      return;
    }

    // 直接开始分析，使用默认 API 密钥
    try {
      const result = await startAnalysisMutation.mutateAsync({
        paperId,
        // 不指定 provider 和 modelName，使用默认密钥
      });

      setAnalysisTaskId(result.taskId);
      toast.success("分析任务已开始，请稍候...");
    } catch (error: any) {
      toast.error(error.message || "启动分析失败");
    }
  };

  const handleStartAnalysis = async () => {
    if (!selectedProvider) {
      toast.error("请选择模型");
      return;
    }

    try {
      const result = await startAnalysisMutation.mutateAsync({
        paperId,
        provider: selectedProvider as any,
        modelName: selectedModel || undefined,
      });

      setAnalysisTaskId(result.taskId);
      toast.success("分析任务已开始");
      setShowAnalysisDialog(false);
    } catch (error: any) {
      toast.error(error.message || "启动分析失败");
    }
  };

  const handleAnalysisComplete = async (success: boolean) => {
    if (success) {
      // 立即刷新数据
      await refetch();
      // 清除任务 ID，隐藏进度跟踪器
      setAnalysisTaskId(null);
      // 显示成功提示
      toast.success("分析报告已生成，正在加载...");
    } else {
      // 分析失败，清除任务 ID
      setAnalysisTaskId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          返回列表
        </Button>

        {/* Paper Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start gap-4 mb-4">
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-4">{paper.title}</h1>
              <p className="text-lg text-muted-foreground mb-2">
                {authors.join(", ")}
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                {paper.category && (
                  <Badge variant="secondary">{paper.category}</Badge>
                )}
                <Badge variant="outline">
                  {new Date(paper.publishedAt).toLocaleDateString()}
                </Badge>
              </div>
            </div>
            {user && (
              <Button
                variant={isFavorited ? "default" : "outline"}
                onClick={handleToggleFavorite}
                disabled={addFavoriteMutation.isPending || removeFavoriteMutation.isPending}
              >
                <Heart className={`h-4 w-4 mr-2 ${isFavorited ? "fill-current" : ""}`} />
                {isFavorited ? "已收藏" : "收藏"}
              </Button>
            )}
          </div>

          <div className="flex gap-2 mb-4">
            {keywords.map((keyword) => (
              <Badge key={keyword} variant="outline">
                {keyword}
              </Badge>
            ))}
          </div>

          <div className="flex gap-2 mb-6">
            <Button
              variant="outline"
              onClick={() => window.open(paper.sourceUrl, "_blank")}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              查看原文
            </Button>
            {!report && (
              <Button
                onClick={handleStartAnalysisClick}
              >
                <Brain className="h-4 w-4 mr-2" />
                开始深度分析
              </Button>
            )}
          </div>
        </div>

        {/* API 密钥提示 */}
        {isAuthenticated && !hasApiKeys && !report && (
          <Alert className="mb-8">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>您还没有配置 API 密钥，无法使用深度分析功能</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/profile")}
              >
                <Settings className="h-4 w-4 mr-2" />
                立即配置
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Analysis Progress */}
        {analysisTaskId && (
          <div className="mb-8">
            <ProgressTracker
              taskId={analysisTaskId}
              onComplete={handleAnalysisComplete}
            />
          </div>
        )}

        {/* Abstract */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>摘要</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              {paper.abstract}
            </p>
          </CardContent>
        </Card>

        {/* Analysis Report */}
        {report && report.status === "completed" ? (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">深度分析报告</h2>

            {/* Summary */}
            {report.summary && (
              <Card>
                <CardHeader>
                  <CardTitle>核心要点</CardTitle>
                </CardHeader>
                <CardContent>
                  <Streamdown>{report.summary}</Streamdown>
                </CardContent>
              </Card>
            )}

            {/* Background */}
            {report.background && (
              <Card>
                <CardHeader>
                  <CardTitle>Background: 问题背景</CardTitle>
                  <CardDescription>
                    为什么会有这个问题存在，包括场景描述、面临瓶颈、发展现状
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Streamdown>{report.background}</Streamdown>
                </CardContent>
              </Card>
            )}

            {/* What */}
            {report.what && (
              <Card>
                <CardHeader>
                  <CardTitle>What: 解决方案</CardTitle>
                  <CardDescription>
                    做什么，包括目标（Goal）和成果（Results）
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Streamdown>{report.what}</Streamdown>
                </CardContent>
              </Card>
            )}

            {/* Why */}
            {report.why && (
              <Card>
                <CardHeader>
                  <CardTitle>Why: 价值与挑战</CardTitle>
                  <CardDescription>
                    为什么要做这件事，包括价值（Values）和挑战（Challenges）
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Streamdown>{report.why}</Streamdown>
                </CardContent>
              </Card>
            )}

            {/* How */}
            {report.how && (
              <Card>
                <CardHeader>
                  <CardTitle>How: 实现方法</CardTitle>
                  <CardDescription>
                    怎么做这件事，包括框架、模块、关键步骤、交互逻辑
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Streamdown>{report.how}</Streamdown>
                </CardContent>
              </Card>
            )}

            {/* How-why */}
            {report.howWhy && (
              <Card>
                <CardHeader>
                  <CardTitle>How-why: 方法论证</CardTitle>
                  <CardDescription>
                    为什么采用这种方法，包括洞察（Insights）和优势（Advantages）
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Streamdown>{report.howWhy}</Streamdown>
                </CardContent>
              </Card>
            )}
          </div>
        ) : report ? (
          <Card>
            <CardHeader>
              <CardTitle>分析报告</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                该论文的分析报告正在生成中，请稍后刷新页面...
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>分析报告</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                暂无分析报告。系统将自动生成分析报告，请稍后刷新页面。
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
