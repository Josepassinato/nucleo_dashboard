import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { Loader2, AlertCircle } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

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

  const hasData = recentInvocations.length > 0 || (costSummary && costSummary.totalInvocations > 0);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
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
        <Tabs defaultValue="invocations" className="space-y-4">
          <TabsList>
            <TabsTrigger value="invocations">Recent Invocations</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
          </TabsList>

          {/* Recent Invocations Tab */}
          <TabsContent value="invocations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Invocations</CardTitle>
                <CardDescription>Last 20 LLM invocations</CardDescription>
              </CardHeader>
              <CardContent>
                {recentInvocations.length > 0 ? (
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
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No invocations yet. Start using LLM skills to see data here.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Skills Tab */}
          <TabsContent value="skills" className="space-y-4">
            {skills.length > 0 ? (
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
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-muted-foreground">No skills configured yet.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Empty State */}
        {!hasData && (
          <Card className="mt-8 border-blue-500/50 bg-blue-500/10">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-blue-600" />
                <CardTitle>Getting Started</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Start using LLM skills to generate data and see optimization recommendations.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
