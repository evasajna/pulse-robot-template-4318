import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, Medal, Award } from "lucide-react";

interface ReferralWinner {
  referrer_mobile: string;
  referral_count: number;
}

const ReferralWinners = () => {
  const [winners, setWinners] = useState<ReferralWinner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReferralWinners();
  }, []);

  const fetchReferralWinners = async () => {
    try {
      // Get all submissions with reference_mobile_number (reference mobile number provided by contestants)
      const { data: submissions, error } = await supabase
        .from("submissions")
        .select("reference_mobile_number")
        .not("reference_mobile_number", "is", null)
        .neq("reference_mobile_number", "");

      if (error) throw error;

      // Count how many times each reference mobile number was provided by contestants
      const referralCounts = submissions.reduce((acc, submission) => {
        const referenceMobileNumber = submission.reference_mobile_number;
        acc[referenceMobileNumber] = (acc[referenceMobileNumber] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Sort by referral count and get top 3
      const sortedWinners = Object.entries(referralCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([referrer_mobile, referral_count]) => ({
          referrer_mobile,
          referral_count
        }));

      setWinners(sortedWinners);
    } catch (error) {
      console.error("Error fetching referral winners:", error);
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

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Referral Champions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">Loading referral winners...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Referral Champions - Top 3 Most Referred Mobile Numbers
        </CardTitle>
      </CardHeader>
      <CardContent>
        {winners.length === 0 ? (
          <div className="text-center text-muted-foreground">
            No referral data available yet.
          </div>
        ) : (
          <div className="space-y-4">
            {winners.map((winner, index) => (
              <div key={winner.referrer_mobile} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getIcon(index)}
                  <div>
                    <div className="font-semibold">{winner.referrer_mobile}</div>
                    <div className="text-sm text-muted-foreground">
                      {winner.referral_count} referrals
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="default">
                    {getRankDisplay(index)} Place
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReferralWinners;