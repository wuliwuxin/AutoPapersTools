import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Heart } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";

export default function PapersList() {
  const [location, navigate] = useLocation();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");
  const [page, setPage] = useState(0);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const limit = 20;
  const offset = page * limit;

  // Fetch papers
  const { data: papersData, isLoading } = trpc.papers.list.useQuery({
    limit,
    offset,
    category: category || undefined,
    searchQuery: searchQuery || undefined,
    sortBy,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
  };

  const categories = [
    { value: "cs.LG", label: "Machine Learning" },
    { value: "stat.ML", label: "Statistical ML" },
    { value: "cs.AI", label: "Artificial Intelligence" },
    { value: "stat.AP", label: "Statistics" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">时间序列分析论文库</h1>
          <p className="text-muted-foreground">
            探索最新的时间序列分析研究，获取AI驱动的深度分析报告
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索论文标题、作者、关键词..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit">搜索</Button>
            </div>

            {/* Date Range Filter */}
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <label className="text-sm text-muted-foreground block mb-1">开始日期</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setPage(0);
                  }}
                />
              </div>
              <div className="flex-1">
                <label className="text-sm text-muted-foreground block mb-1">结束日期</label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setPage(0);
                  }}
                />
              </div>
              {(startDate || endDate) && (
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => {
                    setStartDate("");
                    setEndDate("");
                    setPage(0);
                  }}
                >
                  清除日期
                </Button>
              )}
            </div>
          </form>

          <div className="flex flex-wrap gap-2">
            <div className="text-sm text-muted-foreground">分类:</div>
            <Button
              variant={category === "" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setCategory("");
                setPage(0);
              }}
            >
              全部
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat.value}
                variant={category === cat.value ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setCategory(cat.value);
                  setPage(0);
                }}
              >
                {cat.label}
              </Button>
            ))}
          </div>

          <div className="flex gap-2">
            <div className="text-sm text-muted-foreground">排序:</div>
            <Button
              variant={sortBy === "newest" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortBy("newest")}
            >
              最新
            </Button>
            <Button
              variant={sortBy === "oldest" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortBy("oldest")}
            >
              最早
            </Button>
          </div>
        </div>

        {/* Papers List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : papersData?.papers && papersData.papers.length > 0 ? (
            <>
              {papersData.papers.map((paper) => (
                <Card
                  key={paper.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(`/paper/${paper.id}`)}
                >
                  <CardHeader>
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">{paper.title}</CardTitle>
                        <CardDescription className="mb-2">
                          {JSON.parse(paper.authors || "[]").join(", ")}
                        </CardDescription>
                        <div className="flex flex-wrap gap-2 mb-2">
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
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            // TODO: Add to favorites
                          }}
                        >
                          <Heart className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {paper.abstract}
                    </p>
                  </CardContent>
                </Card>
              ))}

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
                  disabled={!papersData?.papers || papersData.papers.length < limit}
                >
                  下一页
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">暂无论文数据</p>
              <p className="text-sm text-muted-foreground mt-2">
                点击下方按钮从arXiv自动获取最新论文
              </p>
              <Button className="mt-4" onClick={() => navigate("/fetch-papers")}>
                获取论文
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
