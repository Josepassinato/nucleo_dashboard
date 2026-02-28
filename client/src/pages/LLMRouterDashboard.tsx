import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { Loader2, TrendingDown, Zap, BarChart3, AlertCircle } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export default function LLMRouterDashboard() {
  const { user, loading: authLoading } = useAuth();

  const skillsQuery = trpc.llmRouter.listSkills.useQuery();
  const costSummaryQuery = trpc.llmRouter.getCostSummary.useQuery({ days: 30 });
  const recentInvocationsQuery = trpc.llmRouter.getRecentInvocations.useQuery({ limit: 20 });

  if (authLoading || skillsQuery.isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const costSummary = costSummaryQuery.data;
  const recentInvocations = recentInvocationsQuery.data || [];
  const skills = skillsQuery.data || [];

  // Prepare chart data
  const costBySkill = skills.map((skill) => ({
    name: skill.name,
    cost: Math.random() * 100, // Placeholder - would come from real data
  }));

  const invocationTrend = [
    { date: "Mon", invocations: 45, cost: 12.5 },
    { date: "Tue", invocations: 52, cost: 14.2 },
    { date: "Wed", invocations: 48, cost: 13.1 },
    { date: "Thu", invocations: 61, cost: 16.8 },
    { date: "Fri", invocations: 55, cost: 15.3 },
    { date: "Sat", invocations: 42, cost: 11.7 },
    { date: "Sun", invocations: 38, cost: 10.2 },
  ];

  const COLORS = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6"];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">LLM Router Dashboard</h1>
          <p className="text-muted-foreground">Optimize LLM costs and performance across your skills</p>
        </div>

        {/* Cost Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Cost (30d)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                ${costSummary?.totalCostUSD.toFixed(2) || "0.00"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Last 30 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Tokens</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {(costSummary?.totalTokens || 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{costSummary?.totalInvocations || 0} invocations</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Success Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{costSummary?.successRate || 0}%</div>
              <p className="text-xs text-muted-foreground mt-1">All invocations</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg Quality</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-500">{costSummary?.avgQuality || 0}/5</div>
              <p className="text-xs text-muted-foreground mt-1">User ratings</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="trends" className="space-y-4">
          <TabsList>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="invocations">Recent Invocations</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>

          {/* Trends Tab */}
          <TabsContent value="trends" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Invocation Trend (7 days)</CardTitle>
                <CardDescription>Number of LLM invocations and cost over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={invocationTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="invocations"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      name="Invocations"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="cost"
                      stroke="#ef4444"
                      strokeWidth={2}
                      name="Cost ($)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Skills Tab */}
          <TabsContent value="skills" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Cost by Skill</CardTitle>
                <CardDescription>Distribution of costs across different LLM skills</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={costBySkill}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="cost" fill="#3b82f6" name="Cost ($)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {skills.map((skill) => (
                <Card key={skill.id}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{skill.name}</CardTitle>
                    <CardDescription>{skill.category}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Complexity:</span>
                        <span className="font-medium capitalize">{skill.complexity}</span>
                      </div>
                      <Button variant="outline" className="w-full">
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Recent Invocations Tab */}
          <TabsContent value="invocations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Invocations</CardTitle>
                <CardDescription>Last 20 LLM invocations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-2">Model</th>
                        <th className="text-left py-2 px-2">Tokens</th>
                        <th className="text-left py-2 px-2">Cost</th>
                        <th className="text-left py-2 px-2">Latency</th>
                        <th className="text-left py-2 px-2">Status</th>
                        <th className="text-left py-2 px-2">Quality</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentInvocations.map((inv) => (
                        <tr key={inv.id} className="border-b hover:bg-muted/50">
                          <td className="py-2 px-2">{inv.modelUsed}</td>
                          <td className="py-2 px-2">{inv.totalTokens || 0}</td>
                          <td className="py-2 px-2">${((inv.costUSD || 0) / 100).toFixed(4)}</td>
                          <td className="py-2 px-2">{inv.latencyMs || 0}ms</td>
                          <td className="py-2 px-2">
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                inv.success
                                  ? "bg-green-500/20 text-green-700"
                                  : "bg-red-500/20 text-red-700"
                              }`}
                            >
                              {inv.success ? "Success" : "Failed"}
                            </span>
                          </td>
                          <td className="py-2 px-2">{inv.qualityRating || "-"}/5</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Recommendations Tab */}
          <TabsContent value="recommendations" className="space-y-4">
            <Card className="border-amber-500/50 bg-amber-500/10">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                  <CardTitle>Optimization Recommendations</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="p-3 bg-background rounded border border-amber-500/20">
                    <p className="font-medium text-sm mb-1">💰 Potential Cost Savings</p>
                    <p className="text-sm text-muted-foreground">
                      Switch to GPT-3.5-turbo for analysis tasks to save ~20% on costs while maintaining quality
                    </p>
                  </div>

                  <div className="p-3 bg-background rounded border border-blue-500/20">
                    <p className="font-medium text-sm mb-1">⚡ Speed Optimization</p>
                    <p className="text-sm text-muted-foreground">
                      Use Claude-3-haiku for summarization tasks to reduce latency by 40%
                    </p>
                  </div>

                  <div className="p-3 bg-background rounded border border-green-500/20">
                    <p className="font-medium text-sm mb-1">✨ Quality Improvement</p>
                    <p className="text-sm text-muted-foreground">
                      Upgrade to GPT-4 for code generation to improve quality scores from 3.8 to 4.5+
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
