import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, Medal, Award, Clock } from "lucide-react";

interface QuizWinner {
  name: string;
  mobile_number: string;
  score: number;
  submitted_at: string;
  total_questions: number;
}

const QuizWinners = () => {
  const [winners, setWinners] = useState<QuizWinner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuizWinners();
  }, []);

  const fetchQuizWinners = async () => {
    try {
      // Get total questions count
      const { count: totalQuestions } = await supabase
        .from("questions")
        .select("*", { count: "exact" });

      // Get all submissions ordered by score (desc) and then by submission time (asc)
      const { data: submissions, error } = await supabase
        .from("submissions")
        .select("participant_name, mobile_number, score, submitted_at")
        .order("score", { ascending: false })
        .order("submitted_at", { ascending: true })
        .limit(3);

      if (error) throw error;

      const quizWinners = submissions?.map(submission => ({
        name: submission.participant_name,
        mobile_number: submission.mobile_number,
        score: submission.score,
        submitted_at: submission.submitted_at,
        total_questions: totalQuestions || 0
      })) || [];

      setWinners(quizWinners);
    } catch (error) {
      console.error("Error fetching quiz winners:", error);
    }
    setLoading(false);
  };

  const getIcon = (index: number) => {
    switch (index) {
      case 0: return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 1: return <Medal className="h-6 w-6 text-gray-400" />;
      case 2: return <Award className="h-6 w-6 text-amber-600" />;
      default: return <Trophy className="h-6 w-6" />;
    }
  };

  const getRankDisplay = (index: number) => {
    const ranks = ["1st", "2nd", "3rd"];
    return ranks[index] || `${index + 1}th`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Quiz Winners
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">Loading quiz winners...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Quiz Winners - Top 3 by Points & Time
        </CardTitle>
      </CardHeader>
      <CardContent>
        {winners.length === 0 ? (
          <div className="text-center text-muted-foreground">
            No quiz submissions available yet.
          </div>
        ) : (
          <div className="space-y-4">
            {winners.map((winner, index) => (
              <div key={`${winner.mobile_number}-${winner.submitted_at}`} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getIcon(index)}
                  <div>
                    <div className="font-semibold">{winner.name}</div>
                    <div className="text-sm text-muted-foreground">{winner.mobile_number}</div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatDate(winner.submitted_at)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="default" className="mb-1">
                    {getRankDisplay(index)} Place
                  </Badge>
                  <div className="text-sm font-medium">
                    {winner.score}/{winner.total_questions} points
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QuizWinners;