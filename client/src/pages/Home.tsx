import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Brain, Zap, Users, Settings } from "lucide-react";
import { useLocation } from "wouter";

export default function Home() {
  const { user, isAuthenticated, logout } = useAuth();
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Navigation */}
      <nav className="border-b bg-background sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Brain className="h-6 w-6" />
            <h1 className="text-2xl font-bold">时间序列分析论文库</h1>
          </div>
          <div className="flex gap-4 items-center">
            <Button variant="ghost" onClick={() => navigate("/")}>
              首页
            </Button>
            <Button variant="ghost" onClick={() => navigate("/papers")}>
              论文
            </Button>
            <Button variant="ghost" onClick={() => navigate("/fetch-papers")}>
              获取论文
            </Button>
            {isAuthenticated && (
              <>
                <Button variant="ghost" onClick={() => navigate("/upload")}>
                  上传论文
                </Button>
                <Button variant="ghost" onClick={() => navigate("/library")}>
                  我的研究库
                </Button>
              </>
            )}
            {isAuthenticated ? (
              <div className="flex gap-2 items-center">
                <Button variant="ghost" size="sm" onClick={() => navigate("/profile")}>
                  <Settings className="h-4 w-4 mr-2" />
                  个人中心
                </Button>
                <span className="text-sm font-medium">
                  {user?.name || user?.email}
                </span>
                <Button variant="outline" size="sm" onClick={() => logout()}>
                  登出
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => navigate("/login")}>
                  登录
                </Button>
                <Button onClick={() => navigate("/register")}>
                  注册
                </Button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-5xl font-bold mb-6">发现最新的时间序列分析研究</h2>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          自动追踪arXiv最新论文，使用AI生成五维度深度分析报告，帮助研究人员快速理解论文核心价值
        </p>
        <div className="flex gap-4 justify-center">
          <Button size="lg" onClick={() => navigate("/papers")}>
            浏览论文
          </Button>
          <Button size="lg" variant="outline" onClick={() => navigate("/fetch-papers")}>
            获取最新论文
          </Button>
          {isAuthenticated && (
            <Button size="lg" variant="outline" onClick={() => navigate("/upload")}>
              上传本地论文
            </Button>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h3 className="text-3xl font-bold mb-12 text-center">核心功能</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <BookOpen className="h-8 w-8 mb-2" />
              <CardTitle>自动获取论文</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                从arXiv自动获取最新的时间序列分析论文，支持关键词搜索和分类筛选
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Brain className="h-8 w-8 mb-2" />
              <CardTitle>AI深度分析</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                使用大语言模型按Background、What、Why、How、How-why五个维度自动生成结构化分析报告
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Zap className="h-8 w-8 mb-2" />
              <CardTitle>快速检索</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                支持按标题、作者、关键词、会议等多维度搜索和筛选论文，快速找到相关研究
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-8 w-8 mb-2" />
              <CardTitle>个人研究库</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                收藏感兴趣的论文，添加个人笔记，建立专属的研究知识库
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Analysis Structure Section */}
      <section className="container mx-auto px-4 py-16 bg-muted rounded-lg">
        <h3 className="text-3xl font-bold mb-8 text-center">五维度分析框架</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Background</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                问题背景：为什么会有这个问题，面临的瓶颈和发展现状
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">What</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                解决方案：做什么，包括目标和量化成果
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Why</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                价值与挑战：为什么要做，包括价值和挑战
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">How</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                实现方法：怎么做，包括框架、模块和关键步骤
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">How-why</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                方法论证：为什么采用这种方法，包括洞察和优势
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t mt-16 py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2024 时间序列分析论文库 | 由 Manus AI 驱动</p>
        </div>
      </footer>
    </div>
  );
}
