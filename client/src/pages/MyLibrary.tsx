import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, Trash2 } from "lucide-react";

export default function MyLibrary() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [page, setPage] = useState(0);

  const limit = 20;
  const offset = page * limit;

  const { data: favoritesData, isLoading } = trpc.papers.favorites.useQuery(
    { limit, offset },
    { enabled: isAuthenticated }
  );

  const removeFavoriteMutation = trpc.papers.removeFavorite.useMutation();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">请先登录</h1>
          <p className="text-muted-foreground mb-6">
            需要登录才能查看您的研究库
          </p>
          <Button onClick={() => navigate("/login")}>
            登录
          </Button>
        </div>
      </div>
    );
  }

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

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">我的研究库</h1>
          <p className="text-muted-foreground">
            您收藏的论文和个人笔记
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : favoritesData?.favorites && favoritesData.favorites.length > 0 ? (
          <>
            <div className="space-y-4">
              {favoritesData.favorites.map((fav) => (
                <Card key={fav.paper.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start gap-4">
                      <div
                        className="flex-1 cursor-pointer"
                        onClick={() => navigate(`/paper/${fav.paper.id}`)}
                      >
                        <CardTitle className="text-xl mb-2">
                          {fav.paper.title}
                        </CardTitle>
                        <CardDescription className="mb-2">
                          {JSON.parse(fav.paper.authors || "[]").join(", ")}
                        </CardDescription>
                        <div className="flex flex-wrap gap-2">
                          {fav.paper.category && (
                            <Badge variant="secondary">
                              {fav.paper.category}
                            </Badge>
                          )}
                          <Badge variant="outline">
                            {new Date(fav.paper.publishedAt).toLocaleDateString()}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          removeFavoriteMutation.mutateAsync({
                            paperId: fav.paper.id,
                          })
                        }
                        disabled={removeFavoriteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </CardHeader>
                  {fav.notes && (
                    <CardContent>
                      <div className="bg-muted p-3 rounded-lg">
                        <p className="text-sm font-medium mb-1">个人笔记</p>
                        <p className="text-sm text-muted-foreground">
                          {fav.notes}
                        </p>
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center gap-2 mt-8">
              <Button
                variant="outline"
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
              >
                上一页
              </Button>
              <span className="py-2 px-4">
                第 {page + 1} 页
              </span>
              <Button
                variant="outline"
                onClick={() => setPage(page + 1)}
                disabled={
                  !favoritesData?.favorites ||
                  favoritesData.favorites.length < limit
                }
              >
                下一页
              </Button>
            </div>
          </>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>暂无收藏</CardTitle>
              <CardDescription>
                浏览论文列表，点击❤️按钮收藏感兴趣的论文
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate("/")}>
                浏览论文
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
