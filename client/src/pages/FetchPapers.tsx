import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, ArrowLeft, CheckCircle, AlertCircle, Brain, Settings, AlertTriangle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { StaticDeploymentBanner } from "@/components/StaticDeploymentBanner";
import { isGitHubPages } from "@/lib/env";

// 预设搜索关键词 - 时间序列分析相关
const PRESET_QUERIES = [
  // 基础时间序列
  { label: "时间序列预测", value: "time series forecasting", category: "基础" },
  { label: "时间序列分析", value: "time series analysis", category: "基础" },
  { label: "时间序列分类", value: "time series classification", category: "基础" },
  { label: "时间序列异常检测", value: "time series anomaly detection", category: "基础" },
  
  // 负载与能源预测
  { label: "负载预测", value: "load forecasting", category: "应用" },
  { label: "电力负载预测", value: "power load forecasting", category: "应用" },
  { label: "能源预测", value: "energy forecasting", category: "应用" },
  { label: "电力需求预测", value: "electricity demand forecasting", category: "应用" },
  { label: "短期负载预测", value: "short-term load forecasting", category: "应用" },
  
  // 深度学习方法
  { label: "LSTM 时间序列", value: "LSTM time series", category: "方法" },
  { label: "GRU 时间序列", value: "GRU time series", category: "方法" },
  { label: "Transformer 时间序列", value: "transformer time series", category: "方法" },
  { label: "CNN 时间序列", value: "CNN time series", category: "方法" },
  { label: "RNN 时间序列", value: "RNN time series", category: "方法" },
  
  // 注意力机制
  { label: "注意力机制时间序列", value: "attention mechanism time series", category: "方法" },
  { label: "自注意力时间序列", value: "self-attention time series", category: "方法" },
  { label: "多头注意力预测", value: "multi-head attention forecasting", category: "方法" },
  
  // 多变量时间序列
  { label: "多变量时间序列", value: "multivariate time series", category: "高级" },
  { label: "多变量预测", value: "multivariate forecasting", category: "高级" },
  { label: "多步预测", value: "multi-step forecasting", category: "高级" },
  
  // 特定应用领域
  { label: "金融时间序列", value: "financial time series", category: "应用" },
  { label: "股票预测", value: "stock price forecasting", category: "应用" },
  { label: "交通流量预测", value: "traffic flow forecasting", category: "应用" },
  { label: "天气预测", value: "weather forecasting", category: "应用" },
  
  // 新兴方法
  { label: "图神经网络时间序列", value: "graph neural network time series", category: "前沿" },
  { label: "联邦学习时间序列", value: "federated learning time series", category: "前沿" },
  { label: "迁移学习时间序列", value: "transfer learning time series", category: "前沿" },
  { label: "强化学习预测", value: "reinforcement learning forecasting", category: "前沿" },
];

export default function FetchPapers() {
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState("time series forecasting");
  const [maxResults, setMaxResults] = useState(20);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [enableDeepAnalysis, setEnableDeepAnalysis] = useState(false);
  const [hasApiKeys, setHasApiKeys] = useState(false);

  const fetchMutation = trpc.papers.fetchFromArxiv.useMutation();
  
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

  const handleFetch = async () => {
    // 如果启用深度分析但未登录
    if (enableDeepAnalysis && !isAuthenticated) {
      toast.error("深度分析需要登录");
      navigate(`/login?redirect=${encodeURIComponent('/fetch-papers')}`);
      return;
    }

    // 如果启用深度分析但没有配置 API 密钥
    if (enableDeepAnalysis && isAuthenticated && !hasApiKeys) {
      toast.error("请先配置 API 密钥");
      navigate("/profile");
      return;
    }

    try {
      const result = await fetchMutation.mutateAsync({
        searchQuery,
        maxResults,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      
      const successCount = result.results.filter((r) => r.success).length;
      
      if (successCount > 0) {
        toast.success(`成功获取 ${successCount} 篇论文`);
        if (enableDeepAnalysis) {
          toast.info("请在论文详情页面开始深度分析");
        }
      } else {
        toast.error("未能获取任何论文，请尝试其他搜索条件");
      }
    } catch (error: any) {
      toast.error(error.message || "获取论文失败");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          返回列表
        </Button>

        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">从arXiv获取论文</h1>
          <p className="text-muted-foreground mb-8">
            自动从arXiv数据库获取最新的时间序列分析论文，并生成AI驱动的深度分析报告
          </p>

          {isGitHubPages() && (
            <StaticDeploymentBanner feature="从 arXiv 获取论文" />
          )}

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>搜索参数</CardTitle>
              <CardDescription>
                配置搜索条件以获取相关论文
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  搜索关键词
                </label>
                <Input
                  placeholder="例如: time series forecasting"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  disabled={fetchMutation.isPending}
                />
                
                {/* 预设关键词快捷选择 */}
                <div className="mt-3">
                  <p className="text-xs text-muted-foreground mb-2">快速选择（点击填充）：</p>
                  
                  {/* 按分类显示 */}
                  {['基础', '应用', '方法', '高级', '前沿'].map((category) => {
                    const queries = PRESET_QUERIES.filter(q => q.category === category);
                    if (queries.length === 0) return null;
                    
                    return (
                      <div key={category} className="mb-3">
                        <p className="text-xs font-medium text-muted-foreground mb-1.5">{category}：</p>
                        <div className="flex flex-wrap gap-2">
                          {queries.map((preset) => (
                            <button
                              key={preset.value}
                              type="button"
                              onClick={() => setSearchQuery(preset.value)}
                              disabled={fetchMutation.isPending}
                              className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                                searchQuery === preset.value
                                  ? 'bg-primary text-primary-foreground border-primary'
                                  : 'bg-background hover:bg-muted border-border'
                              }`}
                            >
                              {preset.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  最大结果数
                </label>
                <Input
                  type="number"
                  min={1}
                  max={50}
                  value={maxResults}
                  onChange={(e) => setMaxResults(parseInt(e.target.value))}
                  disabled={fetchMutation.isPending}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    开始日期（可选）
                  </label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    disabled={fetchMutation.isPending}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    结束日期（可选）
                  </label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    disabled={fetchMutation.isPending}
                  />
                </div>
              </div>

              {/* API 密钥状态提示 */}
              {isAuthenticated && !hasApiKeys && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="flex items-center justify-between">
                    <span>您还没有配置 API 密钥，无法使用深度分析功能</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate("/profile")}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      配置 API 密钥
                    </Button>
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex items-center space-x-2 p-4 bg-muted rounded-lg">
                <input
                  type="checkbox"
                  id="deepAnalysis"
                  checked={enableDeepAnalysis}
                  onChange={(e) => setEnableDeepAnalysis(e.target.checked)}
                  disabled={fetchMutation.isPending || (!isAuthenticated || !hasApiKeys)}
                  className="rounded"
                />
                <label htmlFor="deepAnalysis" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Brain className="h-4 w-4" />
                    <span className="font-medium">启用深度分析</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {!isAuthenticated 
                      ? "需要登录并配置 API 密钥" 
                      : !hasApiKeys 
                      ? "需要先配置 API 密钥" 
                      : "获取论文后可在详情页面使用您的 API 密钥进行深度分析"}
                  </p>
                </label>
              </div>

              <Button
                onClick={handleFetch}
                disabled={fetchMutation.isPending}
                className="w-full"
                size="lg"
              >
                {fetchMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    正在获取论文...
                  </>
                ) : (
                  "开始获取"
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Results */}
          {fetchMutation.data && (
            <Card>
              <CardHeader>
                <CardTitle>获取结果</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">成功获取</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {fetchMutation.data.results.filter((r) => r.success).length}
                    </p>
                  </div>
                  <div className="bg-red-50 dark:bg-red-950 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">失败</p>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {fetchMutation.data.results.filter((r) => !r.success).length}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {fetchMutation.data.results.map((result, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 p-3 bg-muted rounded-lg"
                    >
                      {result.success ? (
                        <>
                          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">
                              论文已成功添加
                            </p>
                            <p className="text-xs text-muted-foreground">
                              ID: {result.paperId}
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">获取失败</p>
                            <p className="text-xs text-muted-foreground">
                              {result.error}
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>

                <Button
                  onClick={() => navigate("/")}
                  className="w-full"
                >
                  查看论文列表
                </Button>
              </CardContent>
            </Card>
          )}

          {fetchMutation.isError && (
            <Card className="border-red-200 dark:border-red-800">
              <CardHeader>
                <CardTitle className="text-red-600 dark:text-red-400">
                  获取失败
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {fetchMutation.error?.message || "未知错误"}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
