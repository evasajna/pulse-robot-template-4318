import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "@/components/AdminLayout";
import { Search, Download, Trophy, Users, BarChart3, Phone, MapPin, Calendar } from "lucide-react";

interface Submission {
  id: string;
  participant_name: string;
  mobile_number: string;
  panchayath: string;
  score: number;
  reference_id: string;
  submitted_at: string;
  quiz_id: string;
  reference_mobile: string | null;
}

interface Quiz {
  id: string;
  title: string;
}

interface LeaderboardEntry {
  panchayath: string;
  total_participants: number;
  average_score: number;
  top_score: number;
}

interface ReferralEntry {
  mobile_number: string;
  total_referrals: number;
  average_score_of_referrals: number;
}

const AdminSubmissions = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<Submission[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [referralLeaderboard, setReferralLeaderboard] = useState<ReferralEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterSubmissions();
  }, [searchTerm, submissions]);

  const fetchData = async () => {
    try {
      // Fetch submissions
      const { data: submissionsData, error: submissionsError } = await supabase
        .from("submissions")
        .select("*")
        .order("submitted_at", { ascending: false });

      if (submissionsError) throw submissionsError;

      // Fetch quizzes
      const { data: quizzesData, error: quizzesError } = await supabase
        .from("quizzes")
        .select("id, title");

      if (quizzesError) throw quizzesError;

      // Fetch total questions for active quiz
      const { data: questionsData, error: questionsError } = await supabase
        .from("questions")
        .select("id");

      if (questionsError) throw questionsError;

      // Transform submissions data to ensure reference_mobile exists
      const transformedSubmissions = (submissionsData || []).map(submission => ({
        ...submission,
        reference_mobile: (submission as any).reference_mobile || null
      }));

      setSubmissions(transformedSubmissions);
      setQuizzes(quizzesData || []);
      setTotalQuestions(questionsData?.length || 0);

      // Calculate leaderboards
      calculateLeaderboard(transformedSubmissions);
      calculateReferralLeaderboard(transformedSubmissions);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load submissions data.",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const calculateLeaderboard = (submissionsData: Submission[]) => {
    const panchayathStats = submissionsData.reduce((acc, submission) => {
      const panchayath = submission.panchayath;
      if (!acc[panchayath]) {
        acc[panchayath] = {
          panchayath,
          total_participants: 0,
          total_score: 0,
          top_score: 0,
        };
      }
      
      acc[panchayath].total_participants += 1;
      acc[panchayath].total_score += submission.score || 0;
      acc[panchayath].top_score = Math.max(acc[panchayath].top_score, submission.score || 0);
      
      return acc;
    }, {} as Record<string, any>);

    const leaderboardData = Object.values(panchayathStats).map((stats: any) => ({
      panchayath: stats.panchayath,
      total_participants: stats.total_participants,
      average_score: Math.round((stats.total_score / stats.total_participants) * 100) / 100,
      top_score: stats.top_score,
    }));

    // Sort by average score, then by total participants
    leaderboardData.sort((a, b) => {
      if (b.average_score !== a.average_score) {
        return b.average_score - a.average_score;
      }
      return b.total_participants - a.total_participants;
    });

    setLeaderboard(leaderboardData);
  };

  const calculateReferralLeaderboard = (submissionsData: Submission[]) => {
    // Filter submissions that have reference_mobile
    const referredSubmissions = submissionsData.filter(s => s.reference_mobile);
    
    const referralStats = referredSubmissions.reduce((acc, submission) => {
      const refMobile = submission.reference_mobile!;
      if (!acc[refMobile]) {
        acc[refMobile] = {
          mobile_number: refMobile,
          total_referrals: 0,
          total_score: 0,
        };
      }
      
      acc[refMobile].total_referrals += 1;
      acc[refMobile].total_score += submission.score || 0;
      
      return acc;
    }, {} as Record<string, any>);

    const referralLeaderboardData = Object.values(referralStats).map((stats: any) => ({
      mobile_number: stats.mobile_number,
      total_referrals: stats.total_referrals,
      average_score_of_referrals: Math.round((stats.total_score / stats.total_referrals) * 100) / 100,
    }));

    // Sort by total referrals, then by average score
    referralLeaderboardData.sort((a, b) => {
      if (b.total_referrals !== a.total_referrals) {
        return b.total_referrals - a.total_referrals;
      }
      return b.average_score_of_referrals - a.average_score_of_referrals;
    });

    setReferralLeaderboard(referralLeaderboardData);
  };

  const filterSubmissions = () => {
    if (!searchTerm) {
      setFilteredSubmissions(submissions);
      return;
    }

    const filtered = submissions.filter(
      (submission) =>
        submission.participant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.mobile_number.includes(searchTerm) ||
        submission.panchayath.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.reference_id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredSubmissions(filtered);
  };

  const getQuizTitle = (quizId: string) => {
    const quiz = quizzes.find(q => q.id === quizId);
    return quiz ? quiz.title : "Unknown Quiz";
  };

  const exportToCSV = () => {
    const csvContent = [
      ["Name", "Mobile", "Panchayath", "Score", "Reference ID", "Submitted At"].join(","),
      ...filteredSubmissions.map(submission => [
        submission.participant_name,
        submission.mobile_number,
        submission.panchayath,
        submission.score,
        submission.reference_id,
        new Date(submission.submitted_at).toLocaleString()
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `quiz-submissions-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Successful",
      description: "Submissions data exported to CSV file.",
    });
  };

  const getScoreColor = (score: number) => {
    const percentage = (score / totalQuestions) * 100;
    if (percentage >= 80) return "text-success";
    if (percentage >= 60) return "text-warning";
    return "text-destructive";
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center">Loading submissions...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Submissions & Analytics</h1>
            <p className="text-muted-foreground">View quiz results and leaderboard</p>
          </div>
          <Button onClick={exportToCSV} disabled={filteredSubmissions.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Referral Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Trophy className="h-5 w-5 mr-2" />
              Top Referrers - Prize Winners
            </CardTitle>
            <CardDescription>Most referred mobile numbers eligible for 1st, 2nd, and 3rd prizes</CardDescription>
          </CardHeader>
          <CardContent>
            {referralLeaderboard.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No referral data available yet.
              </div>
            ) : (
              <div className="space-y-4">
                {referralLeaderboard.slice(0, 3).map((entry, index) => (
                  <div
                    key={entry.mobile_number}
                    className={`flex items-center justify-between p-6 rounded-lg border-2 ${
                      index === 0 ? "bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-300" :
                      index === 1 ? "bg-gradient-to-r from-gray-50 to-gray-100 border-gray-300" :
                      "bg-gradient-to-r from-amber-50 to-orange-100 border-amber-300"
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${
                        index === 0 ? "bg-yellow-500 text-white shadow-lg" :
                        index === 1 ? "bg-gray-400 text-white shadow-lg" :
                        "bg-amber-600 text-white shadow-lg"
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-foreground">{entry.mobile_number}</h3>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span className="flex items-center font-medium">
                            <Users className="h-4 w-4 mr-1" />
                            {entry.total_referrals} referrals
                          </span>
                          <span className="flex items-center">
                            <BarChart3 className="h-4 w-4 mr-1" />
                            Avg: {entry.average_score_of_referrals}/{totalQuestions}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-bold px-3 py-1 rounded-full ${
                        index === 0 ? "bg-yellow-500 text-white" :
                        index === 1 ? "bg-gray-400 text-white" :
                        "bg-amber-600 text-white"
                      }`}>
                        {index === 0 ? "1st Prize" : index === 1 ? "2nd Prize" : "3rd Prize"}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {Math.round((entry.average_score_of_referrals / totalQuestions) * 100)}% success rate
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Panchayath Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Trophy className="h-5 w-5 mr-2" />
              Panchayath Leaderboard
            </CardTitle>
            <CardDescription>Rankings by average score and participation</CardDescription>
          </CardHeader>
          <CardContent>
            {leaderboard.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No data available for leaderboard.
              </div>
            ) : (
              <div className="space-y-4">
                {leaderboard.slice(0, 10).map((entry, index) => (
                  <div
                    key={entry.panchayath}
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      index < 3 ? "bg-primary/5 border-primary/20" : "bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0 ? "bg-yellow-500 text-white" :
                        index === 1 ? "bg-gray-400 text-white" :
                        index === 2 ? "bg-amber-600 text-white" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="font-semibold">{entry.panchayath}</h3>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span className="flex items-center">
                            <Users className="h-3 w-3 mr-1" />
                            {entry.total_participants} participants
                          </span>
                          <span className="flex items-center">
                            <BarChart3 className="h-3 w-3 mr-1" />
                            Top: {entry.top_score}/{totalQuestions}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">
                        {entry.average_score}/{totalQuestions}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {Math.round((entry.average_score / totalQuestions) * 100)}% avg
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submissions Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Submissions ({filteredSubmissions.length})</CardTitle>
            <CardDescription>Complete list of quiz submissions</CardDescription>
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, mobile, panchayath, or reference ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
          </CardHeader>
          <CardContent>
            {filteredSubmissions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm ? "No submissions match your search." : "No submissions found."}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Participant</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Reference ID</TableHead>
                      <TableHead>Submitted</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubmissions.map((submission) => (
                      <TableRow key={submission.id}>
                        <TableCell>
                          <div className="font-medium">{submission.participant_name}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Phone className="h-3 w-3 mr-1" />
                            {submission.mobile_number}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center text-sm">
                            <MapPin className="h-3 w-3 mr-1" />
                            {submission.panchayath}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getScoreColor(submission.score)}>
                            {submission.score}/{totalQuestions}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <code className="text-xs bg-muted px-1 py-0.5 rounded">
                            {submission.reference_id}
                          </code>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(submission.submitted_at).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(submission.submitted_at).toLocaleTimeString()}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminSubmissions;