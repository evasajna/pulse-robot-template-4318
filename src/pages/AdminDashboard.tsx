import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "@/components/AdminLayout";
import { Users, FileQuestion, Trophy, BarChart3 } from "lucide-react";
import ReferralWinners from "@/components/ReferralWinners";

interface DashboardStats {
  totalSubmissions: number;
  totalQuestions: number;
  averageScore: number;
  topPanchayath: string;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalSubmissions: 0,
    totalQuestions: 0,
    averageScore: 0,
    topPanchayath: "",
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Get total submissions
      const { count: submissionsCount, error: submissionsError } = await supabase
        .from("submissions")
        .select("*", { count: "exact" });

      if (submissionsError) throw submissionsError;

      // Get total questions
      const { count: questionsCount, error: questionsError } = await supabase
        .from("questions")
        .select("*", { count: "exact" });

      if (questionsError) throw questionsError;

      // Get average score
      const { data: submissionsData, error: avgError } = await supabase
        .from("submissions")
        .select("score");

      if (avgError) throw avgError;

      const averageScore = submissionsData.length > 0
        ? submissionsData.reduce((sum, submission) => sum + (submission.score || 0), 0) / submissionsData.length
        : 0;

      // Get top panchayath by submission count
      const { data: panchayathData, error: panchayathError } = await supabase
        .from("submissions")
        .select("panchayath")
        .order("panchayath");

      if (panchayathError) throw panchayathError;

      const panchayathCounts = panchayathData.reduce((acc, submission) => {
        acc[submission.panchayath] = (acc[submission.panchayath] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const topPanchayath = Object.entries(panchayathCounts)
        .sort(([, a], [, b]) => b - a)[0]?.[0] || "None";

      setStats({
        totalSubmissions: submissionsCount || 0,
        totalQuestions: questionsCount || 0,
        averageScore: Math.round(averageScore * 100) / 100,
        topPanchayath,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load dashboard data.",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center">Loading dashboard...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Overview of quiz system performance</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSubmissions}</div>
              <p className="text-xs text-muted-foreground">
                Quiz participants
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Questions</CardTitle>
              <FileQuestion className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalQuestions}</div>
              <p className="text-xs text-muted-foreground">
                Active questions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageScore}</div>
              <p className="text-xs text-muted-foreground">
                Out of {stats.totalQuestions}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Top Panchayath</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold truncate">{stats.topPanchayath}</div>
              <p className="text-xs text-muted-foreground">
                Most participants
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Referral Winners */}
        <ReferralWinners />

        {/* System Overview */}
        <Card>
          <CardHeader>
            <CardTitle>System Overview</CardTitle>
            <CardDescription>
              Quick overview of your quiz management system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Quiz Status</h3>
                  <p className="text-sm text-muted-foreground">
                    Your quiz system is active and accepting submissions.
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Data Integrity</h3>
                  <p className="text-sm text-muted-foreground">
                    All submissions are automatically validated for duplicates.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;