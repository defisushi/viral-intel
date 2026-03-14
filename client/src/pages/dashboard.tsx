import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { getQueryFn } from "@/lib/queryClient";
import type { Topic, ViralPost, Pattern, Framework, Report } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  Plus, X, Search, Zap, TrendingUp, Lightbulb, BarChart3,
  ExternalLink, Trash2, Eye, EyeOff, Sparkles, Target, Brain,
  ArrowRight, ChevronRight, Flame
} from "lucide-react";
import { SiTiktok, SiYoutube, SiInstagram } from "react-icons/si";


function PlatformIcon({ platform }: { platform: string }) {
  const p = platform.toLowerCase();
  if (p.includes("tiktok")) return <SiTiktok className="w-3.5 h-3.5" />;
  if (p.includes("youtube")) return <SiYoutube className="w-3.5 h-3.5" />;
  if (p.includes("instagram")) return <SiInstagram className="w-3.5 h-3.5" />;
  if (p.includes("twitter") || p.includes("x/") || p === "x") return <span className="font-bold text-xs">𝕏</span>;
  return <Search className="w-3.5 h-3.5" />;
}

function platformColor(platform: string): string {
  const p = platform.toLowerCase();
  if (p.includes("tiktok")) return "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900";
  if (p.includes("youtube")) return "bg-red-600 text-white";
  if (p.includes("instagram")) return "bg-gradient-to-r from-purple-500 to-pink-500 text-white";
  if (p.includes("twitter") || p.includes("x")) return "bg-zinc-800 dark:bg-zinc-200 text-white dark:text-zinc-900";
  return "bg-muted text-muted-foreground";
}

// ─── Topic Manager ───
function TopicManager() {
  const { toast } = useToast();
  const [newName, setNewName] = useState("");
  const [newKeywords, setNewKeywords] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editKeywords, setEditKeywords] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: topics = [], isLoading } = useQuery<Topic[]>({
    queryKey: ["/api/topics"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: { name: string; keywords: string[] }) => {
      await apiRequest("POST", "/api/topics", { ...data, enabled: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/topics"] });
      setNewName("");
      setNewKeywords("");
      setDialogOpen(false);
      toast({ title: "Topic added", description: "It will be included in the next scan." });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      await apiRequest("PATCH", `/api/topics/${id}`, { enabled });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/topics"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, name, keywords }: { id: string; name: string; keywords: string[] }) => {
      await apiRequest("PATCH", `/api/topics/${id}`, { name, keywords });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/topics"] });
      setEditingId(null);
      toast({ title: "Topic updated" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/topics/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/topics"] });
      toast({ title: "Topic removed" });
    },
  });

  if (isLoading) return <TopicSkeleton />;

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold" data-testid="text-topics-title">Monitored Topics</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Add keywords to track viral content across platforms</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="w-full sm:w-auto" data-testid="button-add-topic">
              <Plus className="w-4 h-4 mr-1.5" />
              Add Topic
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Topic</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Topic Name</label>
                <Input
                  data-testid="input-topic-name"
                  placeholder="e.g., Crypto Trading"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Keywords</label>
                <Input
                  data-testid="input-topic-keywords"
                  placeholder="crypto, bitcoin, DeFi, web3"
                  value={newKeywords}
                  onChange={(e) => setNewKeywords(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">Comma-separated keywords to search for</p>
              </div>
              <Button
                data-testid="button-save-topic"
                className="w-full"
                disabled={!newName.trim() || !newKeywords.trim() || createMutation.isPending}
                onClick={() => {
                  createMutation.mutate({
                    name: newName.trim(),
                    keywords: newKeywords.split(",").map((k) => k.trim()).filter(Boolean),
                  });
                }}
              >
                {createMutation.isPending ? "Adding..." : "Add Topic"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {topics.map((topic) => (
          <Card key={topic.id} className="p-4" data-testid={`card-topic-${topic.id}`}>
            {editingId === topic.id ? (
              <div className="space-y-3">
                <Input
                  data-testid={`input-edit-name-${topic.id}`}
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
                <Input
                  data-testid={`input-edit-keywords-${topic.id}`}
                  value={editKeywords}
                  onChange={(e) => setEditKeywords(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    data-testid={`button-save-edit-${topic.id}`}
                    onClick={() =>
                      updateMutation.mutate({
                        id: topic.id,
                        name: editName,
                        keywords: editKeywords.split(",").map((k) => k.trim()).filter(Boolean),
                      })
                    }
                  >
                    Save
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>Cancel</Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <h3 className="font-medium text-sm truncate">{topic.name}</h3>
                    {!topic.enabled && (
                      <Badge variant="secondary" className="text-xs shrink-0">Paused</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Switch
                      data-testid={`switch-topic-${topic.id}`}
                      checked={topic.enabled}
                      onCheckedChange={(enabled) =>
                        toggleMutation.mutate({ id: topic.id, enabled })
                      }
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      data-testid={`button-edit-topic-${topic.id}`}
                      onClick={() => {
                        setEditingId(topic.id);
                        setEditName(topic.name);
                        setEditKeywords(topic.keywords.join(", "));
                      }}
                    >
                      <Search className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      data-testid={`button-delete-topic-${topic.id}`}
                      onClick={() => deleteMutation.mutate(topic.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {topic.keywords.map((kw, i) => (
                    <Badge key={i} variant="outline" className="text-xs font-normal">
                      {kw}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      {topics.length === 0 && (
        <div className="text-center py-12">
          <Target className="w-10 h-10 mx-auto mb-3 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">No topics yet. Add one to start monitoring.</p>
        </div>
      )}
    </div>
  );
}

function TopicSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-6 w-40 bg-muted rounded animate-pulse" />
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-20 bg-muted rounded-lg animate-pulse" />
      ))}
    </div>
  );
}

// ─── Report Viewer ───
function ReportViewer() {
  const { data: reports = [], isLoading: reportsLoading } = useQuery<Report[]>({
    queryKey: ["/api/reports"],
  });

  const { data: topics = [] } = useQuery<Topic[]>({
    queryKey: ["/api/topics"],
  });

  const latestDate = reports.length > 0 ? reports[0].date : null;
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const activeDate = selectedDate || latestDate;

  const { data: posts = [] } = useQuery<ViralPost[]>({
    queryKey: ["/api/posts", `?date=${activeDate}`],
    enabled: !!activeDate,
  });

  const { data: patterns = [] } = useQuery<Pattern[]>({
    queryKey: ["/api/patterns", `?date=${activeDate}`],
    enabled: !!activeDate,
  });

  const { data: frameworks = [] } = useQuery<Framework[]>({
    queryKey: ["/api/frameworks", `?date=${activeDate}`],
    enabled: !!activeDate,
  });

  const activeReport = reports.find((r) => r.date === activeDate);
  const topicMap = new Map(topics.map((t) => [t.id, t]));

  // Group by topic
  const topicIds = [...new Set(posts.map((p) => p.topicId))];

  if (reportsLoading) return <ReportSkeleton />;

  if (!activeDate || reports.length === 0) {
    return (
      <div className="text-center py-16">
        <Sparkles className="w-10 h-10 mx-auto mb-3 text-muted-foreground/40" />
        <p className="text-sm font-medium text-muted-foreground">No reports yet</p>
        <p className="text-xs text-muted-foreground mt-1">The first scan runs daily at 9am SGT. Check back soon.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Report date picker */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold" data-testid="text-report-title">Content Intelligence</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Report for {activeDate}
          </p>
        </div>
        {reports.length > 1 && (
          <select
            className="text-sm bg-muted rounded-md px-3 py-1.5 border-0 focus:ring-1 focus:ring-ring"
            value={activeDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            data-testid="select-report-date"
          >
            {reports.map((r) => (
              <option key={r.date} value={r.date}>{r.date}</option>
            ))}
          </select>
        )}
      </div>

      {/* Trend alerts */}
      {activeReport && (
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
          {activeReport.newTrends && activeReport.newTrends.length > 0 && (
            <Card className="p-4 border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-950/20">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">New This Week</span>
              </div>
              <ul className="space-y-1">
                {activeReport.newTrends.map((t, i) => (
                  <li key={i} className="text-xs text-emerald-800 dark:text-emerald-200 flex items-start gap-1.5">
                    <ChevronRight className="w-3 h-3 mt-0.5 shrink-0" />
                    {t}
                  </li>
                ))}
              </ul>
            </Card>
          )}
          {activeReport.fadingTrends && activeReport.fadingTrends.length > 0 && (
            <Card className="p-4 border-amber-500/20 bg-amber-50/50 dark:bg-amber-950/20">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span className="text-sm font-medium text-amber-700 dark:text-amber-300">Fading</span>
              </div>
              <ul className="space-y-1">
                {activeReport.fadingTrends.map((t, i) => (
                  <li key={i} className="text-xs text-amber-800 dark:text-amber-200 flex items-start gap-1.5">
                    <ChevronRight className="w-3 h-3 mt-0.5 shrink-0" />
                    {t}
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      )}

      {/* Per-topic sections */}
      {topicIds.map((topicId) => {
        const topic = topicMap.get(topicId);
        const topicPosts = posts.filter((p) => p.topicId === topicId);
        const topicPatterns = patterns.filter((p) => p.topicId === topicId);
        const topicFrameworks = frameworks.filter((f) => f.topicId === topicId);

        return (
          <div key={topicId} className="space-y-4" data-testid={`section-topic-${topicId}`}>
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-500" />
              <h3 className="font-semibold text-base">{topic?.name || "Unknown Topic"}</h3>
            </div>

            {/* Viral Posts */}
            <div className="grid gap-2">
              {topicPosts.map((post) => (
                <Card key={post.id} className="p-3" data-testid={`card-post-${post.id}`}>
                  <div className="flex items-start gap-3">
                    <div className={`shrink-0 w-7 h-7 rounded-md flex items-center justify-center ${platformColor(post.platform)}`}>
                      <PlatformIcon platform={post.platform} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-muted-foreground">@{post.creator}</span>
                        <span className="text-xs text-muted-foreground/60">{post.platform}</span>
                      </div>
                      <p className="text-sm font-medium leading-snug mb-1">"{post.hook}"</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{post.whyViral}</p>
                    </div>
                    {post.url && (
                      <a
                        href={post.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </Card>
              ))}
            </div>

            {/* Patterns */}
            {topicPatterns.length > 0 && (
              <Card className="p-4 bg-card" data-testid={`card-patterns-${topicId}`}>
                <div className="flex items-center gap-2 mb-3">
                  <Brain className="w-4 h-4 text-violet-500" />
                  <span className="text-sm font-medium">Pattern Analysis</span>
                </div>
                {topicPatterns.map((pat) => (
                  <div key={pat.id} className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                    <div>
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Hook Formulas</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {pat.hookFormulas.map((h, i) => (
                          <Badge key={i} variant="secondary" className="text-xs font-normal">{h}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Emotional Triggers</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {pat.emotionalTriggers.map((t, i) => (
                          <Badge key={i} variant="secondary" className="text-xs font-normal">{t}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Dominant Formats</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {pat.dominantFormats.map((f, i) => (
                          <Badge key={i} variant="secondary" className="text-xs font-normal">{f}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Pain Points</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {pat.painPoints.map((p, i) => (
                          <Badge key={i} variant="secondary" className="text-xs font-normal">{p}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </Card>
            )}

            {/* Frameworks */}
            {topicFrameworks.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  <span className="text-sm font-medium">Content Templates</span>
                </div>
                <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {topicFrameworks.map((fw) => (
                    <Card key={fw.id} className="p-3" data-testid={`card-framework-${fw.id}`}>
                      <div className="flex items-center gap-1.5 mb-2">
                        <div className={`w-5 h-5 rounded flex items-center justify-center ${platformColor(fw.platform)}`}>
                          <PlatformIcon platform={fw.platform} />
                        </div>
                        <Badge variant="outline" className="text-xs font-normal">{fw.format}</Badge>
                      </div>
                      <p className="text-sm font-medium leading-snug mb-1.5">"{fw.hookTemplate}"</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{fw.example}</p>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            <Separator className="mt-2" />
          </div>
        );
      })}
    </div>
  );
}

function ReportSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-6 w-48 bg-muted rounded animate-pulse" />
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-32 bg-muted rounded-lg animate-pulse" />
      ))}
    </div>
  );
}

// ─── Main Dashboard ───
export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b">
        <div className="max-w-4xl mx-auto px-3 sm:px-6 h-12 sm:h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-foreground flex items-center justify-center">
              <Zap className="w-4 h-4 text-background" />
            </div>
            <span className="font-semibold text-base sm:text-lg tracking-tight">Viral Intel</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-8">
        <Tabs defaultValue="topics" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="topics" data-testid="tab-topics">
              <Target className="w-3.5 h-3.5 mr-1.5" />
              Topics
            </TabsTrigger>
            <TabsTrigger value="reports" data-testid="tab-reports">
              <Flame className="w-3.5 h-3.5 mr-1.5" />
              Reports
            </TabsTrigger>
          </TabsList>
          <TabsContent value="topics">
            <TopicManager />
          </TabsContent>
          <TabsContent value="reports">
            <ReportViewer />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t mt-12 sm:mt-16">
        <div className="max-w-4xl mx-auto px-3 sm:px-6 py-3 sm:py-4">
          <p className="text-xs text-muted-foreground">Scans daily at 9am SGT</p>
        </div>
      </footer>
    </div>
  );
}
